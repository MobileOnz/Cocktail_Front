import React, { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from '@react-native-community/blur';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import MapScreen from '../BottomTab/Cocktail_List/CocktailListScreen';
import CocktailBookScreen from '../BottomTab/CocktailBookScreen';
import RecommendationsScreen from '../BottomTab/RecommendationIntroScreen';
import MyPageScreen from '../BottomTab/MyPageScreen';
import LoginBottomSheet from '../BottomSheet/LoginBottomSheetProps';
import theme from '../assets/styles/theme';
import {
  widthPercentage,
  heightPercentage,
  fontPercentage,
} from '../assets/styles/FigmaScreen';
import { isTokenExpired } from '../tokenRequest/Token';
import { BottomTabParamList } from './Navigation';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabNavigator = () => {
  const navigation = useNavigation();
  const [isLoginSheetVisible, setLoginSheetVisible] = useState(false);
  const [_isLoggedIn, setIsLoggedIn] = useState(false);

  // 맞춤 추천 탭 클릭 시 로그인 체크
  const handleRecommendationPress = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      if (!token) {
        setIsLoggedIn(false);
        setLoginSheetVisible(true);
        return;
      }

      const expired = await isTokenExpired();

      if (expired) {
        setIsLoggedIn(false);
        setLoginSheetVisible(true);
        return;
      }

      // 유효한 토큰
      setIsLoggedIn(true);
    } catch (error) {
      console.error('🔒 토큰 확인 중 오류 발생:', error);
      setLoginSheetVisible(true);
    }
  };

  // 커스텀 탭 버튼
  const CustomTabBarButton = (props: any) => (
    <TouchableOpacity
      {...props}
      onPress={() => {
        console.log('🖲 CustomTabBarButton 클릭됨!');
        handleRecommendationPress();
      }}
      activeOpacity={1}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="지도"
        screenOptions={({ route }) => ({
          tabBarBackground: () => (
            <BlurView
              style={{ flex: 1 }}
              blurType="light"
              blurAmount={20}
              reducedTransparencyFallbackColor="rgba(255,255,255,0.6)"
              overlayColor="transparent"
            />
          ),
          tabBarIcon: ({ color }) => {
            let iconSource;
            const iconStyle = {
              width: widthPercentage(18),
              height: heightPercentage(18),
              tintColor: color,
              marginTop: heightPercentage(4),
            };

            if (route.name === '지도') {
              iconSource = require('../assets/drawable/maps.png');
            } else if (route.name === '칵테일 백과') {
              iconSource = require('../assets/drawable/dictionary.png');
            } else if (route.name === '맞춤 추천') {
              iconSource = require('../assets/drawable/recommend.png');
            } else if (route.name === '마이페이지') {
              iconSource = require('../assets/drawable/mypage.png');
            }

            return <Image source={iconSource} style={iconStyle} resizeMode="contain" />;
          },
          // 모든 탭에 동일하게 적용되는 스타일
          tabBarStyle: {
            position: 'absolute',
            height: heightPercentage(60),
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            borderRadius: 100,
            overflow: 'hidden',
            marginBottom: heightPercentage(30),
          },
          tabBarLabelStyle: {
            fontSize: fontPercentage(11),
            paddingBottom: 5,
          },
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,
          },
          tabBarActiveTintColor: 'black',
          tabBarInactiveTintColor: theme.bottomTextColor,
        })}
      >
        <Tab.Screen name="지도" component={MapScreen} options={{ headerShown: false }} />
        <Tab.Screen name="칵테일 백과" component={CocktailBookScreen} options={{ headerShown: false }} />
        <Tab.Screen
          name="맞춤 추천"
          component={RecommendationsScreen}
          options={{
            headerShown: false,
            tabBarButton: CustomTabBarButton,
          }}
        />
        <Tab.Screen name="마이페이지" component={MyPageScreen} options={{ headerShown: false }} />
      </Tab.Navigator>

      {/* 로그인 바텀시트 */}
      <LoginBottomSheet
        isVisible={isLoginSheetVisible}
        onClose={() => setLoginSheetVisible(false)}
        onLogin={() => {
          setIsLoggedIn(true);
          setLoginSheetVisible(false);
          navigation.navigate('맞춤 추천' as never);
        }}
        navigation={navigation}
      />

      {/* ✅ BlurView 뒤 컨텐츠 비치게 하려면 투명 유지 */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: 'transparent' }} />
    </View>
  );
};

export default BottomTabNavigator;
