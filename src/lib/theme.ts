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

/** Pretendard. 주의: 코드베이스에 'Pretandard' 오타가 11곳 있다(별도 티켓). */
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
