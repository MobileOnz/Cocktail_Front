import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../BottomTab/Home/HomeFeedScreen';
import GuideScreen from '../BottomTab/Guide/GuideScreen';
import RecipeBookScreen from '../Screens/RecipeBook/RecipeBookScreen';
import BarListScreen from '../BottomTab/Bar/BarListScreen';
import HomeIcon from '../assets/drawable/Home.svg';
import GuideIcon from '../assets/drawable/Guide.svg';
import BookIcon from '../assets/drawable/Book.svg';
import CocktailIcon from '../assets/drawable/Cocktail.svg';
import { BottomTabParamList } from './Navigation';
import { colors, fonts } from '../lib/theme';

import { heightPercentage } from '../assets/styles/FigmaScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator<BottomTabParamList>();

// 바 탭이 홈과 같은 집 모양(NearBar.svg)이라 구분이 안 됐다 → 칵테일 잔으로 교체.
export const ICON_PATH = {
  홈: HomeIcon,
  가이드: GuideIcon,
  레시피북: BookIcon,
  바: CocktailIcon,
} as const;

const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="홈"
        screenOptions={({ route }) => ({
          // 반투명 blur 배경은 밑의 콘텐츠가 비쳐 판독성을 해쳤다 → 불투명 배경 + 레이블.
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: fonts.medium,
          },
          tabBarStyle: {
            position: 'absolute',
            marginHorizontal: 10,
            bottom: insets.bottom + 12,
            backgroundColor: colors.bg,
            borderTopWidth: 0,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.12,
            shadowRadius: 15,
            elevation: 8,
            height: heightPercentage(60),
            borderRadius: 999,
            overflow: 'hidden',
            paddingBottom: 0,
            paddingTop: 0,
          },
          tabBarItemStyle: {
            height: heightPercentage(60),
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
        <Tab.Screen name="가이드" component={GuideScreen} options={{ headerShown: false }} />
        <Tab.Screen name="레시피북" component={RecipeBookScreen} options={{ headerShown: false }} />
        <Tab.Screen name="바" component={BarListScreen} options={{ headerShown: false }} />
      </Tab.Navigator>
    </View>
  );
};

export default BottomTabNavigator;
