// src/services/RemoteConfig.ts
//
// 채팅 전송 계층의 런타임 설정. SSE 를 켜고 끄는 킬 스위치가 핵심이다.
//
// 왜 필요한가:
//   SSE 는 앱스토어 배포본에 처음 들어가는 장기 연결이다. 특정 통신사 프록시나
//   기업 방화벽이 text/event-stream 을 버퍼링하면 채팅이 통째로 멈춘다.
//   그때 앱 재심사(1~7일) 없이 즉시 폴링으로 되돌릴 수 있어야 한다.
//
// 값의 출처는 세 겹이다. 뒤가 앞을 덮어쓴다.
//   1) DEFAULTS            — 코드에 박힌 안전값
//   2) AsyncStorage 캐시    — 지난 실행에서 받아둔 값 (오프라인 부팅에도 적용)
//   3) applyRemoteConfig() — 서버/원격 설정에서 받아온 값
//
// 서버 설정 엔드포인트는 아직 없다. 그래서 이 모듈은 "주입 가능한 그릇"으로만
// 만들어 두고, 실제 fetch 는 나중에 붙인다. 지금도 킬 스위치는 동작한다 —
// 개발자가 applyRemoteConfig({ sseEnabled: false }) 를 부르면 그 즉시 폴링이다.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'onz.remoteConfig.chat.v1';

export interface ChatRemoteConfig {
  /** false 면 SseTransport 를 아예 만들지 않고 곧장 폴링으로 간다. */
  sseEnabled: boolean;
  /** 폴백 폴링 주기. */
  pollIntervalMs: number;
  /** 이 횟수만큼 연속 재연결에 실패하면 폴링으로 강등한다. */
  sseMaxRetries: number;
  /** 지수 백오프의 첫 대기 시간. */
  sseBackoffBaseMs: number;
  /** 백오프 상한. */
  sseBackoffMaxMs: number;
  /**
   * 한 SSE 연결을 최대 몇 ms 유지할지. 서버 SseEmitter 타임아웃(30분)보다
   * 짧아야 서버가 먼저 끊어서 생기는 에러 이벤트를 피할 수 있다.
   */
  sseConnectionMaxMs: number;
}

const DEFAULTS: ChatRemoteConfig = {
  sseEnabled: true,
  pollIntervalMs: 4000,
  sseMaxRetries: 3,
  sseBackoffBaseMs: 1000,
  sseBackoffMaxMs: 8000,
  sseConnectionMaxMs: 25 * 60 * 1000,
};

let current: ChatRemoteConfig = { ...DEFAULTS };

export function getChatConfig(): ChatRemoteConfig {
  return current;
}

/** 원격에서 받아온 부분 설정을 병합한다. 모르는 키는 무시한다. */
export function applyRemoteConfig(patch: Partial<ChatRemoteConfig>): ChatRemoteConfig {
  current = { ...current, ...sanitize(patch) };
  // 캐시 쓰기는 실패해도 앱을 막지 않는다.
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current)).catch(() => {});
  return current;
}

/** 앱 부팅 시 1회. 캐시된 설정을 복원한다. */
export async function hydrateRemoteConfig(): Promise<ChatRemoteConfig> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      current = { ...DEFAULTS, ...sanitize(JSON.parse(raw) as Partial<ChatRemoteConfig>) };
    }
  } catch {
    current = { ...DEFAULTS };
  }
  return current;
}

/** 테스트 전용. */
export function resetRemoteConfig(): void {
  current = { ...DEFAULTS };
}

// 원격 값이 오염돼도 앱이 죽지 않게 타입/범위를 강제한다.
function sanitize(patch: Partial<ChatRemoteConfig>): Partial<ChatRemoteConfig> {
  const out: Partial<ChatRemoteConfig> = {};
  if (typeof patch.sseEnabled === 'boolean') {
    out.sseEnabled = patch.sseEnabled;
  }
  if (isPositive(patch.pollIntervalMs)) {
    out.pollIntervalMs = clamp(patch.pollIntervalMs, 1000, 60000);
  }
  if (isPositive(patch.sseMaxRetries)) {
    out.sseMaxRetries = clamp(patch.sseMaxRetries, 0, 10);
  }
  if (isPositive(patch.sseBackoffBaseMs)) {
    out.sseBackoffBaseMs = clamp(patch.sseBackoffBaseMs, 200, 10000);
  }
  if (isPositive(patch.sseBackoffMaxMs)) {
    out.sseBackoffMaxMs = clamp(patch.sseBackoffMaxMs, 1000, 60000);
  }
  if (isPositive(patch.sseConnectionMaxMs)) {
    out.sseConnectionMaxMs = clamp(patch.sseConnectionMaxMs, 60000, 29 * 60 * 1000);
  }
  return out;
}

function isPositive(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
