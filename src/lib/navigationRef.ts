// 리액트 트리 밖(axios 인터셉터 등)에서 화면 이동을 하기 위한 참조.
//
// 인증 실패는 인터셉터가 가장 먼저 아는데, 인터셉터에는 navigation prop 이 없다.
// 그래서 예전에는 토스트만 띄우고 끝났다 — 사용자는 로그인이 필요하다는 건 알지만
// 어디로 가야 하는지는 알 수 없었다(데모 QA 지적).
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

/** 로그인 화면으로. 컨테이너가 아직 준비되지 않았으면 조용히 넘어간다. */
export function navigateToLogin(): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Login');
  }
}
