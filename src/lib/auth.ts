// 로그인 게이팅 헬퍼.
//
// 데모 QA: "로그인이 필요한 기능은 로그인 페이지로 이동했으면 좋겠다."
// 그전에는 인증이 필요한 동작이 실패하면 Alert 문구("로그인이 필요할 수 있습니다")로만 끝나서,
// 사용자가 무엇을 해야 하는지 알아도 갈 곳이 없었다. 여기서 로그인 화면까지 데려간다.
import { Alert } from 'react-native';
import { getToken, isTokenExpired } from '../tokenRequest/Token';

/** 로컬 토큰 기준 로그인 여부. 만료된 토큰은 로그인하지 않은 것으로 본다. */
export async function isLoggedIn(): Promise<boolean> {
  const token = await getToken();
  if (!token) { return false; }
  return !(await isTokenExpired());
}

/**
 * 서버 응답이 "인증이 필요하다"고 말하는지.
 *
 * 401 은 물론이고, 이 API 는 본문 code 로도 신호를 준다(-2 = 토큰 재발급 필요).
 * 인터셉터가 재발급까지 시도한 뒤에도 이 값이 올라왔다면 진짜로 로그인이 끊긴 것이다.
 */
export function isAuthError(e: any): boolean {
  // 인터셉터가 토큰 없이 나가는 요청을 미리 끊을 때 다는 표식(axios 응답이 아예 없다).
  if (e?.isAuthError === true) { return true; }
  const status = e?.response?.status;
  const code = e?.response?.data?.code;
  return status === 401 || status === 403 || code === -2;
}

type Navigate = { navigate: (screen: string, params?: object) => void };

/**
 * 로그인 화면으로 안내한다. 이미 로그인 상태면 아무것도 하지 않고 false 를 돌려준다.
 *
 * @param message 왜 로그인이 필요한지 — 기능마다 다르게 준다.
 * @returns 로그인 화면으로 보냈으면 true.
 */
export function promptLogin(navigation: Navigate, message: string): boolean {
  Alert.alert('로그인이 필요해요', message, [
    { text: '나중에', style: 'cancel' },
    { text: '로그인', onPress: () => navigation.navigate('Login') },
  ]);
  return true;
}

/**
 * 인증이 필요한 동작 앞에 세우는 가드.
 *
 * @returns 진행해도 되면 true, 로그인 화면으로 보냈으면 false.
 */
export async function ensureLoggedIn(navigation: Navigate, message: string): Promise<boolean> {
  if (await isLoggedIn()) { return true; }
  promptLogin(navigation, message);
  return false;
}
