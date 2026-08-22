/**
 * 디자인 토큰 (T-21).
 *
 * 감사 결과 src/ 전체에 하드코딩 hex 가 103종·512회 흩어져 있었고,
 * 흰색 하나가 #fff / #FFFFFF / #FFF / #ffffffff 4가지로 표기되고 있었다.
 * 신규 화면은 이 토큰만 사용한다. 기존 화면은 손대는 김에 점진 이관.
 *
 * 값 자체는 기존 화면에서 실제로 가장 많이 쓰이던 것을 채택했다(디자인 변경 아님).
 */

export const colors = {
  // 배경
  bg: '#FFFFFF',
  bgSubtle: '#F8F9FA',
  bgMuted: '#F5F5F5',
  bgInverse: '#1B1B1B',

  // 텍스트
  text: '#1B1B1B',
  textSecondary: '#616161',
  textTertiary: '#868E96',
  textDisabled: '#BDBDBD',
  textInverse: '#FFFFFF',

  // 브랜드 / 강조
  accent: '#FF6B00',

  // 경계 / 구분
  border: '#EEEEEE',
  borderStrong: '#E0E0E0',
  divider: '#F1F3F5',

  // 상태
  danger: '#D64545',
  skeleton: '#E9ECEF',

  // 오버레이
  overlay: 'rgba(0, 0, 0, 0.4)',
} as const;

/**
 * 바 도메인 팔레트 — BarList / BarDetail / BarChat.
 *
 * 원래는 이 도메인만 나이트 무드(검정)였는데, 나머지 탭이 전부 라이트라
 * "앱이 두 개처럼 보인다"는 지적이 디자인 리뷰(2026-07-17 P1-2)와 데모 QA 양쪽에서 나왔다.
 * → 역할 키는 그대로 두고 값만 라이트로 뒤집었다. 화면 코드는 손대지 않아도 되고,
 *   나중에 나이트 무드를 되살리려면 이 객체의 값만 되돌리면 된다.
 *
 * 역할이 뒤집혀도 의미가 유지되는 점에 유의:
 *   text 는 '전경색'이라 버튼 채움색(backgroundColor: bar.text)으로도 쓰인다.
 *   그 위 글자색이 textOnLight 다. 다크에선 흰버튼+검은글자, 라이트에선 검은버튼+흰글자로
 *   자연스럽게 뒤집힌다.
 *
 * QrScanScreen 은 여기 해당하지 않는다 — 카메라 뷰파인더라 검정 배경이 맞다.
 */
export const bar = {
  bg: '#FFFFFF',
  surface: '#F8F9FA', // 입력창·배지·모달
  surfaceHigh: '#F1F3F5', // 버블·버튼·이미지 플레이스홀더 (surface 보다 한 단 진하게)
  surfaceActive: '#DEE2E6', // 비활성 버튼 등
  border: '#EEEEEE',
  borderStrong: '#E0E0E0',
  text: '#1B1B1B',
  textSecondary: '#616161',
  textTertiary: '#868E96',
  textMuted: '#ADB5BD',
  textOnLight: '#FFFFFF', // 채움 버튼(bar.text 배경) 위 텍스트
  warning: '#A66A00', // 흰 배경에서 대비 확보 (다크의 #E0A341 는 흰 위에서 안 읽힌다)
  success: '#1B9E4B',
  overlay: 'rgba(0, 0, 0, 0.4)',
} as const;

/** Pretendard. */
export const fonts = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;

/** 논리 크기. 실제 렌더 시 fontPercentage() 로 감싼다. */
export const fontSize = {
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 17,
  xl: 20,
  xxl: 22,
  hero: 24,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

const tokens = { colors, fonts, fontSize, spacing, radius };
export default tokens;
