import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from '@react-native-community/blur';
import Home from '../BottomTab/Home/HomeFeedScreen';
import NewsScreen from '../BottomTab/News/NewsScreen';
import RecipeBookScreen from '../Screens/RecipeBook/RecipeBookScreen';
import BarListScreen from '../BottomTab/Bar/BarListScreen';
import HomeIcon from '../assets/drawable/Home.svg';
import GuideIcon from '../assets/drawable/Guide.svg';
import BookIcon from '../assets/drawable/Book.svg';
import CocktailIcon from '../assets/drawable/Cocktail.svg';
import { BottomTabParamList } from './Navigation';
import { colors, fonts } from '../lib/theme';

import { TAB_BAR_HEIGHT, TAB_BAR_GAP } from '../lib/layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator<BottomTabParamList>();

// 바 탭이 홈과 같은 집 모양(NearBar.svg)이라 구분이 안 됐다 → 칵테일 잔으로 교체.
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
  return <View style={[StyleSheet.absoluteFill, styles.androidTabBarBackground]} />;
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  // 안드로이드용 blur 근사값. 완전 불투명은 아니어서 밑 콘텐츠의 색조가 살짝 비친다.
  androidTabBarBackground: { backgroundColor: 'rgba(255, 255, 255, 0.94)' },
});

const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <Tab.Navigator
        initialRouteName="홈"
        screenOptions={({ route }) => ({
          // 아이콘만으로는 홈/바 구분이 안 됐다 → 레이블 유지.
          tabBarShowLabel: true,
          // 탭 전환이 굼뜨게 느껴진다는 QA 피드백.
          // 비활성 탭 화면이 계속 살아 있으면(홈 3개·바 2개의 fetch 이펙트, 리스트 리렌더)
          // 전환 프레임을 그려야 할 JS 스레드를 같이 물고 있다. 화면 밖 탭은 얼려 둔다.
          freezeOnBlur: true,
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarBackground: TabBarBackground,
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: fonts.medium,
          },
          tabBarStyle: {
            position: 'absolute',
            marginHorizontal: 10,
            bottom: insets.bottom + TAB_BAR_GAP,
            // 배경은 tabBarBackground(blur) 가 그린다. 여기서 칠하면 blur 를 덮어버린다.
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.12,
            shadowRadius: 15,
            elevation: 8,
            height: TAB_BAR_HEIGHT,
            borderRadius: 999,
            overflow: 'hidden',
            paddingBottom: 0,
            paddingTop: 0,
          },
          tabBarItemStyle: {
            height: TAB_BAR_HEIGHT,
            paddingVertical: 8,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarIcon: ({ color }) => {
            const IconComponent =
              ICON_PATH[route.name as keyof typeof ICON_PATH] ?? ICON_PATH['홈'];
            return <IconComponent width={26} height={26} color={color} />;
          },
        })}
      >
        <Tab.Screen name="홈" component={Home} options={{ headerShown: false }} />
        <Tab.Screen name="매거진" component={NewsScreen} options={{ headerShown: false }} />
        <Tab.Screen name="레시피북" component={RecipeBookScreen} options={{ headerShown: false }} />
        <Tab.Screen name="바" component={BarListScreen} options={{ headerShown: false }} />
      </Tab.Navigator>
    </View>
  );
};

export default BottomTabNavigator;
