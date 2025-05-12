import { Dimensions, PixelRatio } from "react-native";

// Figma 기준 사이즈
const FIGMA_BASE_WIDTH = 375;
const FIGMA_BASE_HEIGHT = 812;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export function widthPercentage(width: number): number {
  return (SCREEN_WIDTH / FIGMA_BASE_WIDTH) * width;
}


export function heightPercentage(height: number): number {
  return (SCREEN_HEIGHT / FIGMA_BASE_HEIGHT) * height;
}

export function fontPercentage(size: number): number {
  const scale = SCREEN_WIDTH / FIGMA_BASE_WIDTH;
  const scaledSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
}
