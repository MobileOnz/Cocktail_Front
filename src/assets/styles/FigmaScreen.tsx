import { Dimensions, PixelRatio, Platform } from 'react-native';

// Figma 기준 사이즈
const FIGMA_BASE_WIDTH = 375;
const FIGMA_BASE_HEIGHT = 812;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 반응형 width
export function widthPercentage(width: number): number {
  return (SCREEN_WIDTH / FIGMA_BASE_WIDTH) * width;
}

// 반응형 height (SafeArea 포함 전체 height 기준)
export function heightPercentage(height: number): number {
  return (SCREEN_HEIGHT / FIGMA_BASE_HEIGHT) * height;
}

// 반응형 font (가로 기준 스케일)
export function fontPercentage(size: number): number {
  const scale = SCREEN_WIDTH / FIGMA_BASE_WIDTH;
  const scaledSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
}

// 기기 분류
export const isSmallDevice = SCREEN_HEIGHT < 700;
export const isMediumDevice = SCREEN_HEIGHT >= 700 && SCREEN_HEIGHT < 800;
export const isLargeDevice = SCREEN_HEIGHT >= 800;
export const isTablet = SCREEN_WIDTH >= 600; 
// 플랫폼
export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

export function getResponsiveHeight(
  iosSmall: number,
  iosDefault: number,
  androidSmall: number,
  androidDefault: number
): number {
  if (isIOS) {
    return isSmallDevice
      ? heightPercentage(iosSmall)
      : heightPercentage(iosDefault);
  } else {
    return isSmallDevice
      ? heightPercentage(androidSmall)
      : heightPercentage(androidDefault);
  }
}
