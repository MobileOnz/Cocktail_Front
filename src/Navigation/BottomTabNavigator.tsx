import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, View, Text, SafeAreaView } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MapScreen from "../BottomTab/Maps";
import CocktailBookScreen from "../BottomTab/CocktailBookScreen";
import RecommendationsScreen from "../BottomTab/RecommendationIntroScreen";
import MyPageScreen from "../BottomTab/MyPageScreen";
import theme from "../assets/styles/theme";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import LoginBottomSheet from "../BottomSheet/LoginBottomSheetProps"; // 로그인 바텀시트 추가
import { useNavigation } from "@react-navigation/native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { isTokenExpired } from "../tokenRequest/Token";
const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const navigation = useNavigation();
  const [isLoginSheetVisible, setLoginSheetVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 


  // 맞춤 추천 탭을 눌렀을 때 실행
  const handleRecommendationPress = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
  
      if (!token) {
        setIsLoggedIn(false);
        setLoginSheetVisible(true); // 로그인 바텀시트 표시
        return;
      }
  
      const expired = await isTokenExpired();
  
      if (expired) {
        setIsLoggedIn(false);
        setLoginSheetVisible(true); // 만료된 경우 로그인 바텀시트 표시
        return;
      }
  
      
      // 유효한 토큰
      setIsLoggedIn(true);
      navigation.navigate("BottomTabNavigator", { screen: "맞춤 추천" });
  
    } catch (error) {
      console.error("🔒 토큰 확인 중 오류 발생:", error);
      setLoginSheetVisible(true); // 오류 시에도 로그인 바텀시트 표시
    }
  };
  

  // 커스텀 탭 버튼
  const CustomTabBarButton = (props) => {
    return (
      <TouchableOpacity 
        {...props} 
        onPress={() => {
          console.log("🖲 CustomTabBarButton 클릭됨!");
          handleRecommendationPress();
        }} 
        activeOpacity={1} 
      />
    );
  };



  return (
    <View style={{ flex: 1}}>
      <Tab.Navigator
        initialRouteName="지도"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconSource;
            let iconStyle = {
              width: widthPercentage(18),
              height: heightPercentage(18),
              tintColor: color,
              marginTop: heightPercentage(4),
            };

            if (route.name === "지도") {
              iconSource = require("../assets/drawable/maps.png");
            } else if (route.name === "칵테일 백과") {
              iconSource = require("../assets/drawable/dictionary.png");
            } else if (route.name === "맞춤 추천") {
              iconSource = require("../assets/drawable/recommend.png");
            } else if (route.name === "마이페이지") {
              iconSource = require("../assets/drawable/mypage.png");
            }

            return <Image source={iconSource} style={iconStyle} resizeMode="contain" />;
          },
          tabBarStyle: {
            height: heightPercentage(60),
            backgroundColor: theme.background,
          },
          tabBarLabelStyle: {
            fontSize: fontPercentage(11),
            paddingBottom: 5,
          },
          tabBarItemStyle: {
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 5,
          },
          tabBarActiveTintColor: "black",
          tabBarInactiveTintColor: theme.bottomTextColor,
        })}
      >
        <Tab.Screen
          name="지도"
          component={MapScreen}
          options={({ route }) => {
            const hideTabBar = route?.params?.hideTabBar;

            return {
              headerShown: false,
              tabBarStyle: hideTabBar
                ? { display: "none" }
                : {
                    height: heightPercentage(60),
                    backgroundColor: theme.background,
                  },
            };
          }}
        />

        <Tab.Screen name="칵테일 백과" component={CocktailBookScreen} options={{ headerShown: false }} />

        {/* 맞춤 추천 버튼 - 로그인 여부 확인 후 처리 */}
        <Tab.Screen
          name="맞춤 추천"
          component={RecommendationsScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <Image
                source={require("../assets/drawable/recommend.png")}
                style={{
                  width: widthPercentage(18),
                  height: heightPercentage(18),
                  tintColor: color,
                  marginTop: heightPercentage(4),
                }}
                resizeMode="contain"
              />
            ),
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
        navigation.navigate("맞춤 추천" as never);
      }}
      navigation={navigation}
    />

  <SafeAreaView 
    edges={['bottom']}
    style={{backgroundColor: theme.background}}
  />
    
    </View>
  );
};

export default BottomTabNavigator;
