import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from '@react-native-community/blur';

// import AsyncStorage from '@react-native-async-storage/async-storage';

import Home from '../BottomTab/Cocktail_List/CocktailListScreen';

import RecommendationsScreen from '../BottomTab/RecommendationIntroScreen';
import MyPageScreen from '../Screens/MyPage/MyPageScreen';

import theme from '../assets/styles/theme';

// import { isTokenExpired } from '../tokenRequest/Token';
import { BottomTabParamList } from './Navigation';
import GuideScreen from '../Screens/Guide/GuideScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TabBarBackground = () => {
  return (
    <SafeAreaView style={styles.container}>
      <BlurView
        style={styles.absolute}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="transparent"
      />
    </SafeAreaView>
  );
};

const BottomTabNavigator = () => {

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="홈"
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          tabBarBackground: () => <TabBarBackground />,
          tabBarStyle: {
            position: 'absolute',
            left: 10,
            right: 10,
            bottom: 50,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            borderRadius: 999,
            overflow: 'hidden',
          },
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 0,
            paddingBottom: 0,
          },
          tabBarIcon: ({ focused }) => {
            let iconSource = 'home';
            if (route.name === '홈') {
              iconSource = 'home';
            } else if (route.name === '맞춤 추천') {
              iconSource = 'glass-cocktail';
            } else if (route.name === '가이드') {
              iconSource = 'food-takeout-box';
            } else if (route.name === '마이페이지') {
              iconSource = 'account-circle';
            }

            return <Icon name={iconSource} color={
              focused ? '#FFF'
                : theme.bottomTextColor} size={20} />;
          },

        })}
      >
        <Tab.Screen name="홈" component={Home} options={{ headerShown: false }} />
        <Tab.Screen
          name="맞춤 추천"
          component={RecommendationsScreen}
          options={{
            headerShown: false,
          }}
        />

        <Tab.Screen
          name="가이드"
          component={GuideScreen}
          options={{
            headerShown: false,
          }}
        />

        <Tab.Screen name="마이페이지" component={MyPageScreen} options={{ headerShown: false }} />
      </Tab.Navigator>


    </View>
  );
};

export default BottomTabNavigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  absolute: {
    ...StyleSheet.absoluteFillObject,
  },
});
