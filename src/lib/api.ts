/**
 * 공통 응답 봉투 언랩 (T-21).
 *
 * 백엔드는 모든 응답을 { code, msg, data } 로 감싼다.
 *   code:  1 = 성공, -1 = 실패, -2 = 토큰 재발급 필요
 *   data:  camelCase (snake_case 아님)
 *
 * 감사에서 확인된 사고: NewsScreen 이 `res.data.data` 를 배열로 가정했으나
 * 실제 data 는 { items, nextCursor } 객체라 화면이 조용히 비어 있었다.
 * 언랩을 한 곳에 모아 같은 실수를 반복하지 않게 한다.
 */
import type { AxiosResponse } from 'axios';

export interface Envelope<T> {
  code: number;
  msg: string;
  data: T;
}

export class ApiError extends Error {
  readonly code: number;
  constructor(message: string, code: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

/** 봉투를 벗겨 data 를 반환한다. code !== 1 이면 서버 msg 를 담아 throw. */
export function unwrap<T>(res: AxiosResponse<Envelope<T>>): T {
  const body = res?.data;
  if (!body || typeof body.code !== 'number') {
    throw new ApiError('서버 응답 형식이 올바르지 않습니다.', -1);
  }
  if (body.code !== 1) {
    throw new ApiError(body.msg || '요청을 처리하지 못했습니다.', body.code);
  }
  return body.data;
}

/** 실패해도 화면을 막지 않아야 하는 부수 호출(조회수 기록 등)용. */
export async function fireAndForget(p: Promise<unknown>): Promise<void> {
  try {
    await p;
  } catch {
    // 의도적 무시: 지표 수집 실패가 사용자 흐름을 끊으면 안 된다.
  }
}

/** 사용자에게 보여줄 한국어 메시지로 변환. */
export function toUserMessage(e: unknown, fallback = '문제가 발생했습니다.'): string {
  if (e instanceof ApiError) { return e.message; }
  const anyE = e as any;
  if (anyE?.response?.status === 401) { return '로그인이 필요합니다.'; }
  if (anyE?.code === 'ECONNABORTED') { return '네트워크가 느립니다. 다시 시도해주세요.'; }
  if (anyE?.message === 'Network Error') { return '네트워크에 연결할 수 없습니다.'; }
  return fallback;
}

export function isUnauthorized(e: unknown): boolean {
  const anyE = e as any;
  // 인터셉터가 토큰 없이/리프레시 실패로 끊은 요청은 axios 응답이 아예 없다.
  // 그때 다는 표식을 같이 봐야 한다 — 이걸 빠뜨려서 세션이 만료됐을 때
  // "로그인이 필요합니다" 대신 "기록하지 못했습니다" 같은 엉뚱한 문구가 나갔다.
  if (anyE?.isAuthError === true) { return true; }
  return anyE?.response?.status === 401
    || anyE?.response?.status === 403
    || (e instanceof ApiError && e.code === -2);
}
