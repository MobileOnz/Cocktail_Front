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
 * 다크(나이트 무드) 팔레트 — 바 도메인 화면(BarList/BarDetail/BarChat/QrScan)용.
 * 기존 화면들에 흩어져 있던 근사 회색들을 역할별로 통합한 값이다(디자인 변경 아님).
 */
export const dark = {
  bg: '#000000',
  surface: '#141414', // 입력창·배지·모달 (기존 #0f0f0f/#111/#141414)
  surfaceHigh: '#1A1A1A', // 버블·버튼·이미지 플레이스홀더 (기존 #161616/#1a1a1a/#1f1f1f)
  surfaceActive: '#333333', // 비활성 버튼 등
  border: '#262626', // (기존 #222/#242424/#262626)
  borderStrong: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#DDDDDD', // (기존 #ccc/#ddd/#eee)
  textTertiary: '#9A9A9A', // (기존 #888/#8a8a8a/#9a9a9a/#aaa)
  textMuted: '#5A5A5A', // (기존 #555/#5a5a5a/#666)
  textOnLight: '#000000', // 흰 배경 버튼 위 텍스트
  warning: '#E0A341',
  success: '#3DDC84',
  overlay: 'rgba(0, 0, 0, 0.7)',
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
