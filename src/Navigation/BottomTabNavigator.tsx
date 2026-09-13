import React from 'react';
import {View, Platform, Pressable, StyleSheet, Text} from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabBarButtonProps,
} from '@react-navigation/bottom-tabs';
import {BlurView} from '@react-native-community/blur';
import Home from '../BottomTab/Home/HomeFeedScreen';
import NewsScreen from '../BottomTab/News/NewsScreen';
import RecipeBookScreen from '../Screens/RecipeBook/RecipeBookScreen';
import BarListScreen from '../BottomTab/Bar/BarListScreen';
import HomeIcon from '../assets/drawable/Home.svg';
import GuideIcon from '../assets/drawable/Guide.svg';
import BookIcon from '../assets/drawable/Book.svg';
import CocktailIcon from '../assets/drawable/Cocktail.svg';
import {BottomTabParamList} from './Navigation';
import {colors, fonts} from '../lib/theme';

import {TAB_BAR_HEIGHT, getFloatingTabBarStyle} from '../lib/layout';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator<BottomTabParamList>();

// 바 탭이 홈과 같은 집 모양(NearBar.svg)이라 구분이 안 됐다 → 칵테일 잔으로 교체.
/** 탭 순서 — 접근성 레이블의 "N / M" 계산에 쓴다. Tab.Screen 선언 순서와 같아야 한다. */
const TAB_ORDER = ['홈', '매거진', '레시피북', '바'] as const;
type TabName = (typeof TAB_ORDER)[number];

export const ICON_PATH = {
  홈: HomeIcon,
  매거진: GuideIcon,
  레시피북: BookIcon,
  바: CocktailIcon,
} as const;

/**
 * 탭바 배경.
 *
 * 이력: 처음엔 반투명이었는데 밑의 카드·텍스트가 그대로 비쳐 판독성을 해쳤고(2026-07-17 리뷰 P1-1),
 * 그래서 불투명으로 덮었다. 이번엔 QA 에서 "원래 의도인 투명"을 요청받아 blur 로 절충한다.
 * blur 는 밑 콘텐츠를 뭉개서 대비를 확보하므로 투명감과 판독성을 동시에 만족한다.
 *
 * Android 의 BlurView 는 실시간 blur 비용이 크고 기기 편차가 심하다 → 반투명 솔리드로 근사한다.
 */
const TabBarBackground = () => {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={20}
        // 손쉬운 사용 > 투명도 줄이기 를 켠 사용자는 blur 가 렌더되지 않는다. 그 경우의 대체 색.
        reducedTransparencyFallbackColor={colors.bg}
      />
    );
  }
  return (
    <View style={[StyleSheet.absoluteFill, styles.androidTabBarBackground]} />
  );
};

/**
 * 탭 하나의 버튼.
 *
 * QA: "현재 어느 화면인지 하단바만 봐서는 잘 안 보인다".
 * 원인은 활성/비활성 구분이 글자색 하나(#1B1B1B vs #697077)뿐이었다는 것 — 둘 다 어두운 회색이라
 * 나란히 놓고 봐야 겨우 구분된다. 활성 탭 뒤에 진한 알약을 깔고 전경을 흰색으로 뒤집어
 * 명도 자체가 반전되게 한다(대비 16:1). 멀리서 훑어도 어디 있는지 바로 읽힌다.
 *
 * 기본 렌더러(PlatformPressable)를 쓰지 않는 이유: @react-navigation/elements 는 직접 의존이 아니다.
 * 대신 그쪽이 넘겨주는 비표준 prop(hoverEffect/pressOpacity/href)을 여기서 걷어낸다.
 */
type TabBarButtonExtraProps = BottomTabBarButtonProps & {
  hoverEffect?: unknown;
  pressOpacity?: number;
};

const TabBarButton = ({
  children,
  style,
  accessibilityState,
  hoverEffect: _hoverEffect,
  pressOpacity: _pressOpacity,
  href: _href,
  ...rest
}: TabBarButtonExtraProps) => {
  const focused = accessibilityState?.selected ?? false;

  return (
    <Pressable
      {...rest}
      accessibilityState={accessibilityState}
      // 기본 렌더러(PlatformPressable)가 채워주던 리플 색을 더는 못 받는다.
      // 색을 안 주면 테마 기본값으로 떨어져 진한 알약 위에서 거의 보이지 않는다.
      android_ripple={{color: 'rgba(0, 0, 0, 0.12)', borderless: true}}
      style={[style, styles.tabButton]}>
      <View style={[styles.tabPill, focused && styles.tabPillActive]}>
        {children}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1},
  // 기본 렌더러의 padding: 5 / justifyContent: 'flex-start' 를 덮는다. 여백은 알약이 갖는다.
  tabButton: {
    padding: 0,
    justifyContent: 'center',
  },
  tabPill: {
    flex: 1,
    alignSelf: 'stretch',
    marginVertical: 6,
    marginHorizontal: 6,
    paddingHorizontal: 4,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: colors.bgInverse,
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
    includeFontPadding: false,
  },
  // 안드로이드용 blur 근사값. 완전 불투명은 아니어서 밑 콘텐츠의 색조가 살짝 비친다.
  androidTabBarBackground: {backgroundColor: 'rgba(255, 255, 255, 0.94)'},
});

const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <Tab.Navigator
        initialRouteName="홈"
        screenOptions={({route}) => ({
          // 아이콘만으로는 홈/바 구분이 안 됐다 → 레이블 유지.
          tabBarShowLabel: true,
          // 탭 전환이 굼뜨게 느껴진다는 QA 피드백.
          // 비활성 탭 화면이 계속 살아 있으면(홈 3개·바 2개의 fetch 이펙트, 리스트 리렌더)
          // 전환 프레임을 그려야 할 JS 스레드를 같이 물고 있다. 화면 밖 탭은 얼려 둔다.
          freezeOnBlur: true,
          // 활성 탭은 진한 알약 위에 얹히므로 전경이 흰색이어야 한다.
          tabBarActiveTintColor: colors.textInverse,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarBackground: TabBarBackground,
          tabBarButton: props => <TabBarButton {...props} />,
          // tabBarLabel 이 함수면 라이브러리가 accessibilityLabel 을 만들어주지 않는다
          // (문자열일 때만 "…, tab, N of M" 을 붙인다). VoiceOver 가 몇 번째 탭인지 못 읽게 되므로
          // 여기서 직접 채운다.
          tabBarAccessibilityLabel: `${route.name}, 탭, ${
            TAB_ORDER.indexOf(route.name as TabName) + 1
          } / ${TAB_ORDER.length}`,
          tabBarLabel: ({focused, color, children}) => (
            <Text
              numberOfLines={1}
              style={[
                styles.tabLabel,
                {color, fontFamily: focused ? fonts.bold : fonts.medium},
              ]}>
              {children}
            </Text>
          ),
          // 배경은 tabBarBackground(blur) 가 그린다. 여기서 칠하면 blur 를 덮어버린다.
          tabBarStyle: getFloatingTabBarStyle(insets.bottom),
          // 세로 여백은 알약(tabPill)의 marginVertical 이 갖는다. 여기서 또 주면 알약이 눌린다.
          // alignItems 를 주지 않는다 — 'center' 면 Pressable 폭이 콘텐츠 폭으로 줄어들어
          // 알약이 탭마다 다른 폭이 된다(홈 39pt vs 레시피북 63pt). 셀 전체를 채우게 둔다.
          tabBarItemStyle: {
            height: TAB_BAR_HEIGHT,
            paddingVertical: 0,
            flexDirection: 'column',
            justifyContent: 'center',
          },
          tabBarIcon: ({color}) => {
            const IconComponent =
              ICON_PATH[route.name as keyof typeof ICON_PATH] ??
              ICON_PATH['홈'];
            return <IconComponent width={24} height={24} color={color} />;
          },
        })}>
        <Tab.Screen name="홈" component={Home} options={{headerShown: false}} />
        <Tab.Screen
          name="매거진"
          component={NewsScreen}
          options={{headerShown: false}}
        />
        <Tab.Screen
          name="레시피북"
          component={RecipeBookScreen}
          options={{headerShown: false}}
        />
        <Tab.Screen
          name="바"
          component={BarListScreen}
          options={{headerShown: false}}
        />
      </Tab.Navigator>
    </View>
  );
};

export default BottomTabNavigator;
