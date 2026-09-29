// 레이아웃 상수 / 훅.
// 하단 탭바는 떠 있는(absolute) 알약 모양이라 스크롤 컨테이너가 자기 밑을 스스로 비워줘야 한다.
// 높이/간격은 이 파일이 단일 출처이고 BottomTabNavigator 가 import 해서 쓴다.
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {heightPercentage} from '../assets/styles/FigmaScreen';
import {colors} from './theme';

/**
 * 탭바 높이의 단일 출처. BottomTabNavigator 가 이 값을 import 해서 tabBarStyle.height 로 쓴다.
 * (예전엔 여기 58, 네비게이터에 60 이 각각 하드코딩돼 2pt 어긋나 있었다.)
 */
/**
 * 활성 탭 알약이 담아야 하는 콘텐츠 높이.
 * 아이콘 래퍼 28 + 레이블 marginTop 2 + lineHeight 14 = 44.
 */
const TAB_CONTENT_HEIGHT = 44;
/** 알약이 위아래로 갖는 여백(BottomTabNavigator 의 tabPill.marginVertical × 2). */
const TAB_PILL_MARGIN = 12;

/**
 * heightPercentage 는 812pt 기준으로 비례 축소한다. 그대로 두면 작은 화면에서 탭바가 줄어들어
 * 알약이 콘텐츠보다 짧아지고, 흰 레이블이 알약 밖으로 새어나가 흰 배경 위에 얹힌다
 * (SE2/SE3 667pt 에서 6.7pt 넘침). 알약이 콘텐츠를 담을 수 있는 최소치를 하한으로 둔다.
 */
export const TAB_BAR_HEIGHT = Math.max(
  heightPercentage(60),
  TAB_CONTENT_HEIGHT + TAB_PILL_MARGIN,
);

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

/**
 * 떠 있는 알약 탭바의 기본 스타일. BottomTabNavigator 의 screenOptions 가 쓰고,
 * 화면 안에서 일시적으로 탭바를 숨겼다가(navigation.setOptions({ tabBarStyle: { display: 'none' } }))
 * 되돌릴 때도 같은 값을 다시 넣어야 모양이 어긋나지 않는다 — 그래서 함수로 뽑아 공유한다.
 */
export const getFloatingTabBarStyle = (insetsBottom: number) => ({
  position: 'absolute' as const,
  marginHorizontal: 10,
  bottom: insetsBottom + TAB_BAR_GAP,
  backgroundColor: 'transparent',
  borderTopWidth: 0,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: '#000000',
  shadowOffset: {width: 0, height: 10},
  shadowOpacity: 0.12,
  shadowRadius: 15,
  elevation: 8,
  height: TAB_BAR_HEIGHT,
  borderRadius: 999,
  overflow: 'hidden' as const,
  paddingBottom: 0,
  paddingTop: 0,
});
