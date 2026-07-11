// 레이아웃 상수 / 훅.
// 하단 탭바는 떠 있는(absolute) 알약 모양이라 스크롤 컨테이너가 자기 밑을 스스로 비워줘야 한다.
// BottomTabNavigator 의 tabBarStyle 과 반드시 같이 움직인다 — 한쪽만 바꾸면 마지막 항목이 가려진다.
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { heightPercentage } from '../assets/styles/FigmaScreen';

/** BottomTabNavigator tabBarStyle.height 와 동일해야 한다. */
export const TAB_BAR_HEIGHT = heightPercentage(58);

/** BottomTabNavigator tabBarStyle.bottom = insets.bottom + TAB_BAR_GAP */
export const TAB_BAR_GAP = 12;

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
