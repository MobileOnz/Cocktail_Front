/**
 * MockLocationDetector — 위치 위조(가짜 GPS) 탐지. (T-22)
 *
 * 서버는 `mockLocationDetected: true` 를 받으면 L2 요청이어도 **L1 으로 강등**한다(실측 확인).
 * 즉 이 값은 "클라이언트의 자진 신고"이며, 서버 보안의 유일한 방어선이 아니다.
 * 악의적 클라이언트는 항상 false 를 보낼 수 있다 — 그건 서버의 다른 방어(반경/QR/impossible travel)가 막는다.
 * 여기서의 목적은 **선의의 사용자가 실수로 모의 위치 앱을 켠 채 인증하는 것을 잡는 것**이다.
 *
 * 네이티브 모듈이 아직 등록되지 않았다면(현재 상태) 항상 false 를 반환한다.
 * → 기능이 조용히 열려 있는 게 아니라, 서버가 QR·반경·정확도로 여전히 게이팅한다.
 *
 * TODO(T-22-native): 아래 두 파일을 각 플랫폼 빌드에 등록하면 실제 값이 흐른다.
 *   iOS     : src/native/MockLocationDetector.swift  → Xcode 프로젝트에 추가 + 브릿지 헤더
 *   Android : src/native/MockLocationDetector.kt     → android/app/src/main/java/... 로 이동 +
 *             MainApplication 의 ReactPackage 목록에 등록
 *   (MainApplication / Xcode project 는 이번 티켓 소유 파일이 아니라 건드리지 않았다.)
 */
import { NativeModules, Platform } from 'react-native';

interface MockLocationDetectorNative {
  /**
   * iOS: CLLocation.sourceInformation.isSimulatedBySoftware (iOS 15+)
   * Android: Location.isMock() (API 31+) / isFromMockProvider() (하위)
   */
  isMockLocation(): Promise<boolean>;
  /** Android 전용: 개발자 옵션의 '모의 위치 앱' 설정 여부. iOS 는 항상 false. */
  isMockLocationEnabledInSettings?(): Promise<boolean>;
}

const native: MockLocationDetectorNative | undefined =
  (NativeModules as any)?.MockLocationDetector;

/** 네이티브 모듈이 앱에 링크되어 있는가. 보고/디버깅용. */
export const isNativeAvailable = (): boolean => native != null;

/**
 * 현재 위치가 모의 위치인지. 판단 불가하면 false(= 의심 없음).
 *
 * false 를 기본값으로 두는 이유: 여기서 true 로 기울면 정상 사용자가 가격을 못 본다.
 * 위조 방어는 서버가 한다(QR 서명 + 150m 반경 + accuracy ≤ 100m + impossible travel).
 */
export async function isMockLocation(): Promise<boolean> {
  if (!native?.isMockLocation) { return false; }
  try {
    return await native.isMockLocation();
  } catch {
    return false;
  }
}

/** Android 개발자 옵션에서 모의 위치 앱이 지정되어 있는지. iOS/미구현 시 false. */
export async function isMockLocationEnabledInSettings(): Promise<boolean> {
  if (Platform.OS !== 'android') { return false; }
  if (!native?.isMockLocationEnabledInSettings) { return false; }
  try {
    return await native.isMockLocationEnabledInSettings();
  } catch {
    return false;
  }
}

/** 두 신호 중 하나라도 걸리면 의심. visit-session 에 그대로 싣는다. */
export async function detectMockLocation(): Promise<boolean> {
  const [mocked, settingsOn] = await Promise.all([
    isMockLocation(),
    isMockLocationEnabledInSettings(),
  ]);
  return mocked || settingsOn;
}

export default { isMockLocation, isMockLocationEnabledInSettings, detectMockLocation, isNativeAvailable };
