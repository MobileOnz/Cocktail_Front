// src/services/ChatTransport.ts
//
// 채팅 수신 경로의 추상화. 화면은 "메시지가 온다"만 알고, 그게 SSE 인지 폴링인지는 모른다.
//
//   BarChatScreen ──> ChatTransport (interface)
//                       ├── SseTransport   (기본. react-native-sse)
//                       └── PollTransport  (폴백. GET /chat/messages?afterId=)
//
// 강등은 자동이다. SSE 가 sseMaxRetries 만큼 연속 실패하면 createChatTransport 가
// 같은 핸들러를 그대로 PollTransport 에 넘겨 이어받게 한다. 화면 코드는 변하지 않는다.
//
// ── 서버 계약 (2026-07-09 로컬 백엔드에서 실제 바이트로 확인) ──────────────────
//   GET  /api/v2/bars/{slug}/chat/stream            (SSE)
//        헤더: Authorization, X-Onz-Bar-Session, [Last-Event-ID]
//        프레임(LF 개행, 콜론 뒤 공백 없음):
//          event:message\ndata:{...}\nid:1\n\n
//          :ping\n\n                       <- 주석. 이벤트로 디스패치되지 않는다
//          event:hidden\ndata:{"id":1}\n\n <- id: 라인이 없다 → Last-Event-ID 는 그대로
//   POST /api/v2/bars/{slug}/chat/messages                      {content}
//   GET  /api/v2/bars/{slug}/chat/messages?afterId=N            (폴링/백필)
//   POST /api/v2/bars/{slug}/chat/messages/{id}/report          {reason, detail}
//   POST /api/v2/bars/{slug}/chat/identities/{authorRef}/block
//
// 실패 봉투: { code:-1, msg:"...", data:{ reason:"SESSION_EXPIRED", ... } }

import { API_BASE_URL } from '@env';

// ── 도메인 타입 ────────────────────────────────────────────────────────────

export type TrustLevel = 'L1' | 'L2';

export interface ChatMessage {
  id: number;
  /** 익명 작성자 식별자. memberId 는 서버 스키마에 아예 없다. 차단 키로 쓴다. */
  authorRef: string;
  nickname: string;
  content: string;
  status: 'VISIBLE' | 'HIDDEN';
  createdAt: string;
  isMine: boolean;
}

/** 3인 신고로 자동 블라인드된 메시지. */
export interface HiddenEvent {
  id: number;
}

export type TransportKind = 'sse' | 'poll';

export type ConnectionState =
  | 'connecting'
  | 'open'
  | 'reconnecting'
  | 'polling'
  | 'closed';

/** 서버가 돌려주는 실패 사유. 재시도해도 소용없는 것들이 섞여 있다. */
export type ChatFailureReason =
  | 'SESSION_REQUIRED'
  | 'SESSION_EXPIRED'
  | 'SESSION_INVALID'
  | 'MUTED'
  | 'RATE_LIMITED'
  | 'OUT_OF_RANGE'
  | 'UNKNOWN';

export class ChatFatalError extends Error {
  readonly reason: ChatFailureReason;
  readonly status: number;

  constructor(reason: ChatFailureReason, message: string, status: number) {
    super(message);
    this.name = 'ChatFatalError';
    this.reason = reason;
    this.status = status;
  }
}

/** 세션을 다시 받아야 풀리는 사유. 화면은 이걸 보고 T-22 재인증으로 보낸다. */
export function needsReauth(reason: ChatFailureReason): boolean {
  return (
    reason === 'SESSION_REQUIRED' ||
    reason === 'SESSION_EXPIRED' ||
    reason === 'SESSION_INVALID'
  );
}

// ── 전송 계층 인터페이스 ────────────────────────────────────────────────────

export interface ChatTransportHandlers {
  onMessage(message: ChatMessage): void;
  onHidden(event: HiddenEvent): void;
  onState(state: ConnectionState, kind: TransportKind): void;
  /** 재시도해도 소용없는 실패. 화면이 사용자에게 알려야 한다. */
  onFatal(error: ChatFatalError): void;
  /** SSE → 폴링 강등. 배지 문구를 바꾸는 용도. */
  onDowngrade?(reason: string): void;
}

export interface ChatTransportOptions {
  slug: string;
  /** AsyncStorage 의 accessToken. axios 인터셉터와 동일하게 접두사 없이 그대로 보낸다. */
  authToken: string;
  /** BarSessionStore 에서 읽어온 방문 세션 토큰. */
  sessionToken: string;
  /** 재진입 시 이어받을 마지막 이벤트 id. */
  lastEventId?: number | null;
  handlers: ChatTransportHandlers;
}

export interface ChatTransport {
  readonly kind: TransportKind;
  start(): void;
  stop(): void;
  /** 재연결/전환 시 이어받을 커서. */
  lastEventId(): number | null;
}

// ── 공용 유틸 ──────────────────────────────────────────────────────────────

/** axios 인스턴스와 같은 baseURL. SSE 는 axios 를 타지 않으므로 여기서 다시 만든다. */
export function chatBaseUrl(): string {
  const base = API_BASE_URL || 'http://onz-cocktail.kr/onz';
  return base.replace(/\/+$/, '');
}

export function streamUrl(slug: string): string {
  return `${chatBaseUrl()}/api/v2/bars/${encodeURIComponent(slug)}/chat/stream`;
}

/** 어떤 모양으로 오든 실패 봉투에서 reason 을 뽑아낸다. */
export function reasonOf(payload: unknown): ChatFailureReason {
  const known: ChatFailureReason[] = [
    'SESSION_REQUIRED',
    'SESSION_EXPIRED',
    'SESSION_INVALID',
    'MUTED',
    'RATE_LIMITED',
    'OUT_OF_RANGE',
  ];
  const raw = (payload as { data?: { reason?: unknown } } | null)?.data?.reason;
  return known.includes(raw as ChatFailureReason) ? (raw as ChatFailureReason) : 'UNKNOWN';
}

/** SSE 프레임의 data: 를 ChatMessage 로. 모양이 다르면 null (연결을 죽이지 않는다). */
export function parseChatMessage(data: string | null): ChatMessage | null {
  if (!data) {
    return null;
  }
  try {
    const m = JSON.parse(data) as Partial<ChatMessage>;
    if (typeof m.id !== 'number' || typeof m.content !== 'string') {
      return null;
    }
    return {
      id: m.id,
      authorRef: m.authorRef ?? '',
      nickname: m.nickname ?? '알 수 없음',
      content: m.content,
      status: m.status === 'HIDDEN' ? 'HIDDEN' : 'VISIBLE',
      createdAt: m.createdAt ?? '',
      isMine: m.isMine === true,
    };
  } catch {
    return null;
  }
}

export function parseHiddenEvent(data: string | null): HiddenEvent | null {
  if (!data) {
    return null;
  }
  try {
    const h = JSON.parse(data) as Partial<HiddenEvent>;
    return typeof h.id === 'number' ? { id: h.id } : null;
  } catch {
    return null;
  }
}

// ── BarSessionStore 어댑터 계약 (실제 구현은 s2 / T-22) ──────────────────────
//
// 여기서는 "얇은 계약 + mock" 만 정의한다. s2 가 진짜 스토어를 만들면 앱 부팅 시
// registerBarSessionStore(realStore) 한 줄만 부르면 된다. 이 파일은 s2 모듈을
// import 하지 않으므로 그쪽 구현이 없어도 타입체크가 통과한다.

export interface BarSession {
  sessionToken: string;
  trustLevel: TrustLevel;
  /** ISO-8601. 만료 전 재발급 판단에 쓴다. */
  expiresAt: string;
  nickname: string;
  authorRef: string;
}

export interface BarSessionStore {
  get(slug: string): Promise<BarSession | null>;
  set(slug: string, session: BarSession): Promise<void>;
  clear(slug: string): Promise<void>;
}

/** 개발용 mock. 세션이 없다고만 답한다 → 화면은 "인증 필요" 상태로 정직하게 떨어진다. */
const mockBarSessionStore: BarSessionStore = {
  async get() {
    return null;
  },
  async set() {
    /* no-op */
  },
  async clear() {
    /* no-op */
  },
};

let registered: BarSessionStore | null = null;

/** s2 가 앱 부팅 시 1회 호출한다. */
export function registerBarSessionStore(store: BarSessionStore): void {
  registered = store;
}

export function getBarSessionStore(): BarSessionStore {
  return registered ?? mockBarSessionStore;
}

export function isBarSessionStoreReady(): boolean {
  return registered !== null;
}

/** 채팅은 L1 이상이면 된다. QR(L2) 은 가격에만 필요하다. */
export function canChat(trustLevel: TrustLevel | null | undefined): boolean {
  return trustLevel === 'L1' || trustLevel === 'L2';
}
