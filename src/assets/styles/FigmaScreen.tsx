
import {} from "react-native"
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
}from "react-native-responsive-dimensions"

// Figma 기준 사이즈: 375 x (812 - 88) 
const FIGMA_BASE_WIDTH = 375;
const FIGMA_BASE_HEIGHT = 724;

export function widthPercentage(width : number) : number {
  const percentage = (width / FIGMA_BASE_WIDTH) * 100
  return responsiveWidth(percentage)
}

export function heightPercentage(height : number) : number {
  const percentage = (height / FIGMA_BASE_HEIGHT) * 100
  return responsiveHeight(percentage)
}

export function fontPercentage(size : number): number{
  const percentage = size*0.13
  return responsiveFontSize(percentage)
}