import React from "react";
import { Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MapScreen from "../BottomTab/Maps";
import CocktailBookScreen from "../BottomTab/CocktailBookScreen";
import RecommendationsScreen from "../BottomTab/RecommendationIntroScreen";
import MyPageScreen from "../BottomTab/MyPageScreen";
import theme from "../assets/styles/theme";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import RecommendationIntroScreen from "../BottomTab/RecommendationIntroScreen";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator initialRouteName="지도"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconSource;
          let iconStyle = {
            width: widthPercentage(18),
            height: heightPercentage(18),
            tintColor: color,
            marginTop: heightPercentage(4 ),
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
      <Tab.Screen name="맞춤 추천" component={RecommendationIntroScreen} options={{ headerShown: false }} />
      <Tab.Screen name="마이페이지" component={MyPageScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
