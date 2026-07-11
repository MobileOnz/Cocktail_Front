// src/services/PollTransport.ts
//
// SSE 폴백. GET /chat/messages?afterId=N 을 주기적으로 친다.
//
// SSE 와 동일한 커서(afterId = 마지막 이벤트 id)를 쓰기 때문에 전환 시점에
// 메시지가 비거나 겹치지 않는다. 그래서 SSE → 폴링 강등이 화면에서 이음매 없이 보인다.
//
// 한계(의도된 것):
//   - hidden 이벤트를 실시간으로 받을 수 없다. 서버는 블라인드된 메시지를 목록에서
//     빼서 주므로, 폴링 중에는 "다음 폴에서 조용히 사라진다". 즉시 가려지진 않는다.
//   - 그래서 폴링은 어디까지나 폴백이다. 기본은 SSE 다.

import instance from '../tokenRequest/axios_interceptor';
import {
  ChatFatalError,
  ChatMessage,
  ChatTransport,
  ChatTransportOptions,
  TransportKind,
  parseChatMessage,
  reasonOf,
} from './ChatTransport';
import { getChatConfig } from './RemoteConfig';

const SESSION_HEADER = 'X-Onz-Bar-Session';

export class PollTransport implements ChatTransport {
  readonly kind: TransportKind = 'poll';

  private readonly opts: ChatTransportOptions;
  private cursor: number | null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private stopped = false;
  private inFlight = false;
  /** 연속 실패 횟수. 일시적 네트워크 오류로 배지를 깜빡이지 않으려고 쓴다. */
  private consecutiveErrors = 0;

  constructor(opts: ChatTransportOptions) {
    this.opts = opts;
    this.cursor = opts.lastEventId ?? null;
  }

  start(): void {
    this.stopped = false;
    this.opts.handlers.onState('polling', this.kind);
    this.tick();
  }

  stop(): void {
    this.stopped = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.opts.handlers.onState('closed', this.kind);
  }

  lastEventId(): number | null {
    return this.cursor;
  }

  private schedule(): void {
    if (this.stopped) {
      return;
    }
    this.timer = setTimeout(() => this.tick(), getChatConfig().pollIntervalMs);
  }

  private async tick(): Promise<void> {
    if (this.stopped || this.inFlight) {
      return;
    }
    this.inFlight = true;
    try {
      const res = await instance.get(
        `/api/v2/bars/${encodeURIComponent(this.opts.slug)}/chat/messages`,
        {
          params: this.cursor === null ? undefined : { afterId: this.cursor },
          headers: { [SESSION_HEADER]: this.opts.sessionToken },
        },
      );

      const rows = (res.data?.data ?? []) as unknown[];
      for (const row of rows) {
        // 서버 응답은 이미 객체다. SSE 파서와 검증 로직을 공유하려고 문자열로 되돌린다.
        const msg: ChatMessage | null = parseChatMessage(JSON.stringify(row));
        if (!msg) {
          continue;
        }
        if (this.cursor === null || msg.id > this.cursor) {
          this.cursor = msg.id;
        }
        this.opts.handlers.onMessage(msg);
      }

      if (this.consecutiveErrors > 0) {
        this.consecutiveErrors = 0;
        this.opts.handlers.onState('polling', this.kind);
      }
    } catch (e: unknown) {
      this.handleError(e);
    } finally {
      this.inFlight = false;
      this.schedule();
    }
  }

  private handleError(e: unknown): void {
    const err = e as { response?: { status?: number; data?: unknown } };
    const status = err.response?.status ?? 0;

    // 세션이 죽었으면 몇 번을 더 폴링해도 똑같다. 즉시 화면에 알린다.
    if (status === 401 || status === 403) {
      const body = err.response?.data;
      const reason = reasonOf(body);
      const msg = (body as { msg?: string } | undefined)?.msg ?? '채팅 세션이 만료됐어요';
      this.stopped = true;
      this.opts.handlers.onFatal(new ChatFatalError(reason, msg, status));
      return;
    }

    // 그 외(네트워크 순단, 5xx)는 조용히 다음 폴에서 재시도한다.
    this.consecutiveErrors += 1;
    if (this.consecutiveErrors === 2) {
      this.opts.handlers.onState('reconnecting', this.kind);
    }
  }
}
