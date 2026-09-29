// src/services/SseTransport.ts
//
// 기본 수신 경로. react-native-sse(순수 JS, XMLHttpRequest 기반) 위에 얹는다.
// 네이티브 링크/pod install 이 필요 없다 — RN 의 XHR polyfill 만 쓴다.
//
// 서버가 실제로 내보내는 바이트 (로컬 18080 에서 curl -N 으로 확인):
//   event:message\ndata:{"id":1,...,"isMine":false}\nid:1\n\n
//   :ping\n\n
//   event:hidden\ndata:{"id":1}\n\n
// → 콜론 뒤 공백 없음, LF 개행, hidden 에는 id: 라인이 없다.
//   react-native-sse 의 파서는 /event:?\s*/ 로 잘라내므로 공백 유무를 모두 흡수하고,
//   ':' 로 시작하는 주석(:ping)은 어떤 리스너로도 디스패치하지 않는다. 그대로 맞는다.
//
// 재연결은 우리가 직접 한다(pollingInterval: 0 으로 라이브러리 자동 재연결을 끈다).
// 이유: 백오프를 통제하고, 연속 실패 시 폴링으로 강등해야 하기 때문이다.

import {
  ChatFatalError,
  ChatTransport,
  ChatTransportOptions,
  TransportKind,
  parseChatMessage,
  parseHiddenEvent,
  reasonOf,
  streamUrl,
} from './ChatTransport';
import { PollTransport } from './PollTransport';
import { getChatConfig } from './RemoteConfig';

const SESSION_HEADER = 'X-Onz-Bar-Session';

// react-native-sse 가 설치돼 있지 않아도 이 파일은 타입체크/번들이 되어야 한다.
// 그래서 정적 import 대신 런타임 require 로 가져오고, 필요한 표면만 직접 타이핑한다.
declare const require: (moduleName: string) => unknown;

interface SseEventLike {
  type: string;
  data?: string | null;
  lastEventId?: string | null;
  message?: string;
  xhrStatus?: number;
}

interface EventSourceLike {
  addEventListener(type: string, listener: (event: SseEventLike) => void): void;
  removeAllEventListeners(): void;
  close(): void;
}

type EventSourceCtor = new (
  url: string,
  options: Record<string, unknown>,
) => EventSourceLike;

let ctorCache: EventSourceCtor | null | undefined;

function loadEventSource(): EventSourceCtor | null {
  if (ctorCache !== undefined) {
    return ctorCache;
  }
  try {
    const mod = require('react-native-sse') as
      | { default?: EventSourceCtor }
      | EventSourceCtor;
    const ctor =
      typeof mod === 'function' ? mod : (mod as { default?: EventSourceCtor }).default;
    ctorCache = typeof ctor === 'function' ? ctor : null;
  } catch {
    ctorCache = null;
  }
  return ctorCache;
}

export function isSseAvailable(): boolean {
  return getChatConfig().sseEnabled && loadEventSource() !== null;
}

// ── SseTransport ──────────────────────────────────────────────────────────

export class SseTransport implements ChatTransport {
  readonly kind: TransportKind = 'sse';

  private readonly opts: ChatTransportOptions;
  private es: EventSourceLike | null = null;
  private cursor: number | null;
  private retries = 0;
  private stopped = false;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  /** SSE 를 포기하고 폴링으로 넘어갈 때 호출된다. createChatTransport 가 채워 넣는다. */
  onGiveUp: ((reason: string) => void) | null = null;

  constructor(opts: ChatTransportOptions) {
    this.opts = opts;
    this.cursor = opts.lastEventId ?? null;
  }

  start(): void {
    this.stopped = false;
    this.connect();
  }

  stop(): void {
    this.stopped = true;
    this.clearRetry();
    this.teardown();
    this.opts.handlers.onState('closed', this.kind);
  }

  lastEventId(): number | null {
    return this.cursor;
  }

  // ── 내부 ────────────────────────────────────────────────────────────────

  private connect(): void {
    const EventSource = loadEventSource();
    if (!EventSource) {
      this.giveUp('react-native-sse 를 불러올 수 없어요');
      return;
    }

    this.opts.handlers.onState(this.retries === 0 ? 'connecting' : 'reconnecting', this.kind);

    const headers: Record<string, string> = {
      // axios 인터셉터와 동일하게 접두사 없이 원본 토큰을 보낸다.
      Authorization: this.opts.authToken,
      [SESSION_HEADER]: this.opts.sessionToken,
      Accept: 'text/event-stream',
    };
    if (this.cursor !== null) {
      headers['Last-Event-ID'] = String(this.cursor);
    }

    const cfg = getChatConfig();
    const es = new EventSource(streamUrl(this.opts.slug), {
      method: 'GET',
      headers,
      // 자동 재연결 끄기. 백오프와 강등은 우리가 결정한다.
      pollingInterval: 0,
      timeoutBeforeConnection: 0,
      // 서버 SseEmitter 타임아웃(30분)보다 먼저 우리가 끊고 새로 연다.
      timeout: cfg.sseConnectionMaxMs,
      lineEndingCharacter: '\n',
      debug: false,
    });
    this.es = es;

    es.addEventListener('open', () => {
      this.retries = 0;
      this.opts.handlers.onState('open', this.kind);
    });

    es.addEventListener('message', event => {
      const msg = parseChatMessage(event.data ?? null);
      if (!msg) {
        return;
      }
      if (this.cursor === null || msg.id > this.cursor) {
        this.cursor = msg.id;
      }
      this.opts.handlers.onMessage(msg);
    });

    // hidden 프레임에는 id: 라인이 없다 → 커서를 건드리지 않는다. 의도된 동작이다.
    es.addEventListener('hidden', event => {
      const hidden = parseHiddenEvent(event.data ?? null);
      if (hidden) {
        this.opts.handlers.onHidden(hidden);
      }
    });

    es.addEventListener('error', event => this.handleError(event));
    es.addEventListener('close', () => {
      if (!this.stopped) {
        this.scheduleRetry();
      }
    });
  }

  private handleError(event: SseEventLike): void {
    if (this.stopped) {
      return;
    }
    const status = event.xhrStatus ?? 0;

    // 인증/세션 실패는 재시도 대상이 아니다. 폴링으로 강등해도 똑같이 401 이 난다.
    if (status === 401 || status === 403) {
      let body: unknown = null;
      try {
        body = event.message ? JSON.parse(event.message) : null;
      } catch {
        body = null;
      }
      const msg = (body as { msg?: string } | null)?.msg ?? '채팅 세션이 만료됐어요';
      this.teardown();
      this.opts.handlers.onFatal(new ChatFatalError(reasonOf(body), msg, status));
      return;
    }

    // 'timeout' 은 우리가 건 25분 상한이 도달한 정상 종료다. 즉시 새로 연다.
    if (event.type === 'timeout') {
      this.teardown();
      this.connect();
      return;
    }

    this.scheduleRetry();
  }

  private scheduleRetry(): void {
    this.teardown();
    const cfg = getChatConfig();
    this.retries += 1;

    if (this.retries > cfg.sseMaxRetries) {
      this.giveUp(`SSE 연결에 ${cfg.sseMaxRetries}회 실패`);
      return;
    }

    const delay = Math.min(
      cfg.sseBackoffBaseMs * Math.pow(2, this.retries - 1),
      cfg.sseBackoffMaxMs,
    );
    this.opts.handlers.onState('reconnecting', this.kind);
    this.retryTimer = setTimeout(() => {
      if (!this.stopped) {
        this.connect();
      }
    }, delay);
  }

  private giveUp(reason: string): void {
    this.stopped = true;
    this.clearRetry();
    this.teardown();
    this.onGiveUp?.(reason);
  }

  private clearRetry(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  private teardown(): void {
    if (this.es) {
      this.es.removeAllEventListeners();
      this.es.close();
      this.es = null;
    }
  }
}

// ── 자동 강등 래퍼 ──────────────────────────────────────────────────────────
//
// 화면은 이것 하나만 쓴다. SSE 로 시작하고, 안 되면 조용히 폴링으로 갈아탄다.
// 커서(lastEventId)를 그대로 넘기므로 전환 구간에서 메시지가 새거나 겹치지 않는다.

class AutoChatTransport implements ChatTransport {
  private active: ChatTransport;
  private readonly opts: ChatTransportOptions;
  private stopped = false;

  constructor(opts: ChatTransportOptions) {
    this.opts = opts;
    this.active = isSseAvailable() ? this.makeSse(opts) : new PollTransport(opts);
  }

  get kind(): TransportKind {
    return this.active.kind;
  }

  start(): void {
    this.active.start();
  }

  stop(): void {
    this.stopped = true;
    this.active.stop();
  }

  lastEventId(): number | null {
    return this.active.lastEventId();
  }

  private makeSse(opts: ChatTransportOptions): ChatTransport {
    const sse = new SseTransport(opts);
    sse.onGiveUp = reason => {
      if (this.stopped) {
        return;
      }
      this.opts.handlers.onDowngrade?.(reason);
      // 끊긴 지점부터 이어받는다.
      this.active = new PollTransport({ ...opts, lastEventId: sse.lastEventId() });
      this.active.start();
    };
    return sse;
  }
}

export function createChatTransport(opts: ChatTransportOptions): ChatTransport {
  return new AutoChatTransport(opts);
}
