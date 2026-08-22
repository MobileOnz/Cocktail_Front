// 레이아웃 상수 / 훅.
// 하단 탭바는 떠 있는(absolute) 알약 모양이라 스크롤 컨테이너가 자기 밑을 스스로 비워줘야 한다.
// 높이/간격은 이 파일이 단일 출처이고 BottomTabNavigator 가 import 해서 쓴다.
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { heightPercentage } from '../assets/styles/FigmaScreen';

/**
 * 탭바 높이의 단일 출처. BottomTabNavigator 가 이 값을 import 해서 tabBarStyle.height 로 쓴다.
 * (예전엔 여기 58, 네비게이터에 60 이 각각 하드코딩돼 2pt 어긋나 있었다.)
 */
export const TAB_BAR_HEIGHT = heightPercentage(60);

/**
 * BottomTabNavigator tabBarStyle.bottom = insets.bottom + TAB_BAR_GAP
 * QA: 12 는 홈 인디케이터에서 너무 떠 보인다("위치가 어색") → 6 으로 낮춘다.
 */
export const TAB_BAR_GAP = 6;

/** 탭바와 마지막 항목 사이 숨쉴 틈. */
const BREATHING_ROOM = 16;

/**
 * 탭 화면의 스크롤 컨테이너 contentContainerStyle 에 paddingBottom 으로 넣을 값.
 * 탭이 없는 스택 화면에서는 쓰지 않는다.
 */
export const useTabBarSpace = (): number => {
  const insets = useSafeAreaInsets();
  return insets.bottom + TAB_BAR_GAP + TAB_BAR_HEIGHT + BREATHING_ROOM;
};
