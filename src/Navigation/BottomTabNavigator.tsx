import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import Home from '../BottomTab/Home/HomeFeedScreen';
import GuideScreen from '../BottomTab/Guide/GuideScreen';
import RecipeBookScreen from '../Screens/RecipeBook/RecipeBookScreen';
import BarListScreen from '../BottomTab/Bar/BarListScreen';
import HomeIcon from '../assets/drawable/Home.svg';
import GuideIcon from '../assets/drawable/Guide.svg';
import BookIcon from '../assets/drawable/Book.svg';
import NearBarIcon from '../assets/drawable/NearBar.svg';
import { BottomTabParamList } from './Navigation';

import { heightPercentage } from '../assets/styles/FigmaScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const ICON_PATH = {
  홈: HomeIcon,
  가이드: GuideIcon,
  레시피북: BookIcon,
  바: NearBarIcon,
} as const;

const TabBarBackground = () => {
  return (
    <View style={styles.container}>
      <BlurView
        blurType="dark"
        blurAmount={1}
        reducedTransparencyFallbackColor="transparent"
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
        ]}
      />

      <LinearGradient
        style={StyleSheet.absoluteFill}
        colors={[
          'rgba(255, 255, 255, 0.15)',
          'transparent',
          'rgba(255, 255, 255, 0.15)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
    </View>
  );
};

const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="홈"
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          tabBarBackground: () => <TabBarBackground />,
          tabBarStyle: {
            position: 'absolute',
            marginHorizontal: 10,
            bottom: insets.bottom + 12,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 15,
            elevation: 0,
            height: heightPercentage(58),
            borderRadius: 999,
            overflow: 'hidden',
            paddingBottom: 0,
            paddingTop: 0,
          },
          tabBarIconStyle: {
            width: '100%',
            height: '100%',
            marginBottom: 0,
            marginTop: 0,
          },
          tabBarItemStyle: {
            height: heightPercentage(58),
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarIcon: ({ focused }) => {
            const IconComponent =
              ICON_PATH[route.name as keyof typeof ICON_PATH] ?? ICON_PATH['홈'];

            const c = focused ? '#FFFFFF' : '#E0E0E0';

            return (
              <IconComponent
                width={focused ? 44 : 40}
                height={focused ? 44 : 40}
                color={c}
              />
            );
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245, 245, 245, 1)',
  },
  absolute: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
});
