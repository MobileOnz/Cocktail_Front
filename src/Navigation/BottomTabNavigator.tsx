import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MapScreen from "../BottomTab/Maps";
import CocktailBookScreen from "../BottomTab/CocktailBookScreen";
import RecommendationsScreen from "../BottomTab/RecommendationIntroScreen";
import MyPageScreen from "../BottomTab/MyPageScreen";
import theme from "../assets/styles/theme";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import LoginBottomSheet from "../BottomSheet/LoginBottomSheetProps"; // 로그인 바텀시트 추가
import { useNavigation } from "@react-navigation/native";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const navigation = useNavigation();
  const [isLoginSheetVisible, setLoginSheetVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // 실제로는 토큰 확인 필요

  // 맞춤 추천 탭을 눌렀을 때 실행
  const handleRecommendationPress = () => {

    if (!isLoggedIn) {
      setLoginSheetVisible(true); // 로그인 바텀시트 표시
    } else {
      navigation.navigate("BottomTabNavigator", { screen: "맞춤 추천" });
    }
  };

  // isLoginSheetVisible 상태가 변경될 때 로그 확인
  useEffect(() => {
    console.log("🛑 isLoginSheetVisible 상태 변경됨:", isLoginSheetVisible);
  }, [isLoginSheetVisible]);

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
    <>


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
        <Tab.Screen name="지도" component={MapScreen} options={{ headerShown: false }} />
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
            navigation.navigate("BottomTabNavigator", { screen: "맞춤 추천" });
          }}
          />
    
    </>
  );
};

export default BottomTabNavigator;
