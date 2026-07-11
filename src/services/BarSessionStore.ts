/**
 * BarSessionStore — 바 방문 세션(신뢰등급) 보관소. (T-22)
 *
 * ⚠️ 이 파일의 공개 인터페이스는 s4(BarChatScreen / ChatTransport)와의 계약이다.
 *    변경 시 반드시 알린다.
 *
 * 백엔드 계약 (로컬 실측):
 *   POST /api/v2/bars/{slug}/visit-session        (JWT)
 *        body { qrPayload?, lat, lng, accuracyM?, mockLocationDetected? }
 *        200 → VisitSessionDto
 *        403 → { reason: 'OUT_OF_RANGE' | 'INVALID_QR' | 'IMPOSSIBLE_TRAVEL' }
 *   POST /api/v2/bars/{slug}/visit-session/renew  (JWT + X-Onz-Bar-Session)
 *        body **필수** { lat, lng, accuracyM?, qrPayload?, mockLocationDetected? }
 *   GET  /api/v2/bars/{slug}/menu                 (X-Onz-Bar-Session 선택)
 *
 * 반드시 알아야 할 두 가지 (실측으로 확인):
 *   1. renew 는 body 가 없으면 500 이다. 좌표를 반드시 실어야 한다.
 *   2. renew 에 qrPayload 를 빼면 **L2 세션이 L1 으로 강등된다**(가격이 사라진다).
 *      그래서 L2 를 만든 qrPayload 를 세션과 함께 저장해 갱신 때 다시 보낸다.
 *
 * 저장소: react-native-mmkv (encryptionKey). Keychain 은 아직 미설치라 후속 이관 대상.
 */
import { MMKV } from 'react-native-mmkv';
import DeviceInfo from 'react-native-device-info';
import instance from '../tokenRequest/axios_interceptor';
import { unwrap } from '../lib/api';

// __DEV__ + 시뮬레이터에서만 참. 로컬 Docker 백엔드는 타임존 없는 LocalDateTime 을 UTC 벽시계로
// 주는데 시뮬레이터 시계는 KST 라, 서버 시각을 KST 로 해석하면 갓 발급된 30분 세션이 즉시 만료로
// 판정된다(→ sessionHeader 가 비어 메뉴가 L0 로 떨어져 가격이 안 뜬다). dev-시뮬레이터에서만
// UTC 로 해석해 이 로컬 환경 격차를 흡수한다. 프로덕션(서버 TZ == 기기 TZ 가정)에는 절대 적용 안 됨.
const isDevSimulator = __DEV__ && DeviceInfo.isEmulatorSync();

export type TrustLevel = 'L0' | 'L1' | 'L2';

export type VisitDenyReason = 'OUT_OF_RANGE' | 'INVALID_QR' | 'IMPOSSIBLE_TRAVEL' | 'UNKNOWN';

/** POST /visit-session 200 응답 = data */
export interface VisitSessionDto {
  sessionToken: string;
  trustLevel: TrustLevel;
  priceVisible: boolean;
  chatEnabled: boolean;
  issuedAt: string;
  expiresAt: string;
  renewCount: number;
  distanceM: number;
  nickname: string;
  authorRef: string;
}

/** 저장 단위. VisitSessionDto + 갱신에 필요한 부가 정보. */
export interface BarSession extends VisitSessionDto {
  slug: string;
  /** L2 를 만든 QR. 갱신 시 다시 보내지 않으면 L1 으로 깎인다. 비밀값 아님(장기 서명). */
  qrPayload?: string;
}

export interface Coords {
  lat: number;
  lng: number;
  accuracyM?: number;
  mockLocationDetected?: boolean;
}

export class VisitDeniedError extends Error {
  readonly reason: VisitDenyReason;
  readonly distanceM?: number;
  constructor(message: string, reason: VisitDenyReason, distanceM?: number) {
    super(message);
    this.name = 'VisitDeniedError';
    this.reason = reason;
    this.distanceM = distanceM;
  }
}

/** 만료 이 시간 전부터 갱신을 시도한다. */
export const RENEW_THRESHOLD_MS = 5 * 60 * 1000;

type Listener = (session: BarSession | null) => void;

// ── 저장소 ────────────────────────────────────────────────────────────────
// TODO(T-24): encryptionKey 를 Keychain 에서 읽어오도록 교체. 현재는 앱 번들 상수라
//   루팅/탈옥 기기에서 복호화 가능하다. 세션은 30분 TTL + 회원·매장 바인딩이라 피해는 제한적.
const storage = new MMKV({ id: 'bar-session', encryptionKey: 'onz-bar-session-v1' });

const key = (slug: string) => `session:${slug}`;

const listeners = new Map<string, Set<Listener>>();

function emit(slug: string, session: BarSession | null) {
  listeners.get(slug)?.forEach(l => {
    try { l(session); } catch { /* 리스너 예외가 저장 흐름을 막지 않는다 */ }
  });
}

// ── 순수 헬퍼 ─────────────────────────────────────────────────────────────

export function msUntilExpiry(session: Pick<BarSession, 'expiresAt'>): number {
  // 서버는 타임존 없는 LocalDateTime 을 준다. 로컬 시간으로 해석한다.
  // (dev-시뮬레이터 한정: 로컬 Docker 는 UTC 라 'Z' 를 붙여 해석한다. 위 isDevSimulator 주석 참고.)
  const t = new Date(isDevSimulator ? `${session.expiresAt}Z` : session.expiresAt).getTime();
  if (isNaN(t)) { return 0; }
  return t - Date.now();
}

export function isExpired(session: Pick<BarSession, 'expiresAt'>): boolean {
  return msUntilExpiry(session) <= 0;
}

export function needsRenew(session: Pick<BarSession, 'expiresAt'>): boolean {
  const left = msUntilExpiry(session);
  return left > 0 && left <= RENEW_THRESHOLD_MS;
}

// ── 조회 / 저장 ───────────────────────────────────────────────────────────

/** 만료된 세션은 반환하지 않고 조용히 제거한다. */
export function getSession(slug: string): BarSession | null {
  const raw = storage.getString(key(slug));
  if (!raw) { return null; }
  try {
    const s = JSON.parse(raw) as BarSession;
    if (isExpired(s)) {
      clearSession(slug);
      return null;
    }
    return s;
  } catch {
    clearSession(slug);
    return null;
  }
}

export function saveSession(session: BarSession): void {
  storage.set(key(session.slug), JSON.stringify(session));
  emit(session.slug, session);
}

export function clearSession(slug: string): void {
  storage.delete(key(slug));
  emit(slug, null);
}

export function clearAll(): void {
  storage.getAllKeys()
    .filter(k => k.startsWith('session:'))
    .forEach(k => {
      storage.delete(k);
      emit(k.slice('session:'.length), null);
    });
}

/** 세션이 있으면 헤더, 없으면 빈 객체. 그대로 axios config.headers 에 펼쳐 쓴다. */
export function sessionHeader(slug: string): Record<string, string> {
  const s = getSession(slug);
  return s ? { 'X-Onz-Bar-Session': s.sessionToken } : {};
}

/** 현재 신뢰등급. 세션 없거나 만료면 L0. */
export function getTrustLevel(slug: string): TrustLevel {
  return getSession(slug)?.trustLevel ?? 'L0';
}

/** 세션 변경 구독. 반환값을 호출하면 해제. */
export function subscribe(slug: string, listener: Listener): () => void {
  if (!listeners.has(slug)) { listeners.set(slug, new Set()); }
  listeners.get(slug)!.add(listener);
  return () => { listeners.get(slug)?.delete(listener); };
}

// ── 네트워크 ──────────────────────────────────────────────────────────────

function toDeniedError(e: any): VisitDeniedError | null {
  const status = e?.response?.status;
  if (status !== 403 && status !== 400) { return null; }
  const body = e?.response?.data;
  const reason: VisitDenyReason = body?.data?.reason ?? 'UNKNOWN';
  const msg = body?.msg ?? '매장 인증에 실패했어요.';
  return new VisitDeniedError(msg, reason, body?.data?.distanceM);
}

/**
 * 매장 인증. QR 없이 부르면 L1(채팅만), 유효 QR + mock=false + accuracy<=100m 면 L2(가격).
 * 실패 시 VisitDeniedError(reason) 을 throw 한다.
 */
export async function createSession(
  slug: string,
  coords: Coords,
  qrPayload?: string,
): Promise<BarSession> {
  try {
    const res = await instance.post(`/api/v2/bars/${slug}/visit-session`, {
      ...(qrPayload ? { qrPayload } : {}),
      lat: coords.lat,
      lng: coords.lng,
      ...(coords.accuracyM != null ? { accuracyM: coords.accuracyM } : {}),
      ...(coords.mockLocationDetected != null
        ? { mockLocationDetected: coords.mockLocationDetected }
        : {}),
    });
    const dto = unwrap<VisitSessionDto>(res);
    // 서버가 L2 를 안 줬다면 qrPayload 를 붙들고 있을 이유가 없다(강등된 것).
    const session: BarSession = {
      ...dto,
      slug,
      ...(dto.trustLevel === 'L2' && qrPayload ? { qrPayload } : {}),
    };
    saveSession(session);
    return session;
  } catch (e) {
    const denied = toDeniedError(e);
    if (denied) {
      // IMPOSSIBLE_TRAVEL 이면 서버가 기존 세션을 폐기했다. 로컬도 맞춘다.
      if (denied.reason === 'IMPOSSIBLE_TRAVEL') { clearSession(slug); }
      throw denied;
    }
    throw e;
  }
}

/**
 * 세션 갱신. body 가 필수이며(없으면 서버 500), L2 유지를 위해 저장해둔 qrPayload 를 함께 보낸다.
 * 세션이 없거나 만료됐으면 null.
 */
export async function renewSession(slug: string, coords: Coords): Promise<BarSession | null> {
  const current = getSession(slug);
  if (!current) { return null; }

  try {
    const res = await instance.post(
      `/api/v2/bars/${slug}/visit-session/renew`,
      {
        ...(current.qrPayload ? { qrPayload: current.qrPayload } : {}),
        lat: coords.lat,
        lng: coords.lng,
        ...(coords.accuracyM != null ? { accuracyM: coords.accuracyM } : {}),
        ...(coords.mockLocationDetected != null
          ? { mockLocationDetected: coords.mockLocationDetected }
          : {}),
      },
      { headers: { 'X-Onz-Bar-Session': current.sessionToken } },
    );
    const dto = unwrap<VisitSessionDto>(res);
    const session: BarSession = {
      ...dto,
      slug,
      ...(dto.trustLevel === 'L2' && current.qrPayload ? { qrPayload: current.qrPayload } : {}),
    };
    saveSession(session);
    return session;
  } catch (e) {
    const denied = toDeniedError(e);
    if (denied) {
      clearSession(slug);
      throw denied;
    }
    // 401 = 세션 만료/폐기. 로컬도 버린다.
    if ((e as any)?.response?.status === 401) {
      clearSession(slug);
      return null;
    }
    throw e;
  }
}

/** 만료 5분 전이면 갱신, 아니면 현재 세션 그대로. 실패해도 throw 하지 않는다. */
export async function renewIfNeeded(slug: string, coords: Coords): Promise<BarSession | null> {
  const current = getSession(slug);
  if (!current) { return null; }
  if (!needsRenew(current)) { return current; }
  try {
    return await renewSession(slug, coords);
  } catch {
    return getSession(slug);
  }
}

export default {
  getSession,
  saveSession,
  clearSession,
  clearAll,
  sessionHeader,
  getTrustLevel,
  subscribe,
  createSession,
  renewSession,
  renewIfNeeded,
  isExpired,
  needsRenew,
  msUntilExpiry,
  RENEW_THRESHOLD_MS,
};
