import React, { useEffect, useRef, useState } from "react";
import { View, Text, Image, StyleSheet, Animated, Dimensions, StatusBar, TouchableOpacity, SafeAreaView, Platform} from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import { StackScreenProps } from "@react-navigation/stack";
import { widthPercentage, heightPercentage, fontPercentage, getResponsiveHeight } from "../assets/styles/FigmaScreen";
import theme from "../assets/styles/theme";
import { Portal } from "react-native-paper";
import LoginBottomSheet from "../BottomSheet/LoginBottomSheetProps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  BottomTabNavigator: { screen: "지도" | "칵테일 백과" | "맞춤 추천" | "마이페이지" };
};
const { height: screenHeight } = Dimensions.get("window");

type OnboardingScreenProps = StackScreenProps<RootStackParamList, "Onboarding">;

interface SlideItem {
  key: string;
  title: string;
  text: string;
  image: any;
}

const slides: SlideItem[] = [
  {
    key: "1",
    title: "지도",
    text: "내가 원하는 분위기의 가게와 메뉴를\n 지역별로 한 번에 확인해요",
    image: require("../assets/onboarding/description1.png"),
  },
  {
    key: "2",
    title: "칵테일 백과",
    text: " 평소에 궁금했던 칵테일의\n 맛과 정보를 확인해요",
    image: require("../assets/onboarding/description2.png"),
  },
  {
    key: "3",
    title: "맞춤 추천",
    text: "오늘의 기분과 취향을 입력하면\n 나만의 칵테일을 만들어줘요",
    image: require("../assets/onboarding/description3.png"),
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets()
    const [isLoginSheetVisible, setLoginSheetVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const onSlideChange = (index: number) => {
    setActiveIndex(index);
    Animated.timing(animatedValue, {
      toValue: index,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
        {slides.map((_, i) => {
          const scaleAnim = animatedValue.interpolate({ // 도트 크기 및 애니메이션 효과 
            inputRange: [i - 1, i, i + 1],
            outputRange: [1, 1, 1],
            extrapolate: "clamp",
            
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  transform: [{ scale: scaleAnim }],
                  backgroundColor: activeIndex === i ? "black" : "gray",
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const renderItem = ({item}: { item: SlideItem; index: number }) => (
    
    <View style={[styles.slide, {backgroundColor : theme.background}]}>


      <Image source={item.image} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
       
    </View>
  );

return (
  <>

  <View style={{flex : 1,backgroundColor: theme.background,paddingTop: insets.top, paddingBottom: insets.bottom  }}>
    
    <AppIntroSlider
      renderItem={renderItem}
      data={slides}
      showSkipButton={false}
      showNextButton={false}
      showDoneButton={false}
      dotStyle={{ display: "none" }}
      activeDotStyle={{ display: "none" }}
      onSlideChange={onSlideChange}
    />

    {/*애니메이션 효과 넣기*/}
    {renderPagination()}

    
    {/* 고정된 버튼 영역 */}
    <View style={[styles.buttonContainer, {  paddingHorizontal: widthPercentage(16),
      paddingBottom: Platform.OS === "android" ? 24 : insets.bottom || 24,  }]}>
      <TouchableOpacity
        onPress={() => navigation.navigate("BottomTabNavigator", { screen: "지도" })}
        style={styles.outlineButton}
      >
        <Text style={styles.outlineButtonText}>칵테일 바 찾기</Text>
      </TouchableOpacity>

      <TouchableOpacity
      onPress={async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        navigation.navigate("BottomTabNavigator", { screen: "맞춤 추천" });
      } else {
      setLoginSheetVisible(true); // 로그인 모달 표시
      }
      }}
  style={styles.filledButton}
>
  <Text style={styles.filledButtonText}>취향 알아보기</Text>
</TouchableOpacity>
    </View>

  </View>

  

  <Portal>
  <LoginBottomSheet
   isVisible={isLoginSheetVisible}
   onClose={() => setLoginSheetVisible(false)}
   onLogin={() => {
     setLoginSheetVisible(false);
     navigation.navigate("Login");
   }}
   navigation={navigation}
 />
 </Portal>
 </>
);

};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection : "row",
    alignItems : "center",
    marginBottom : getResponsiveHeight(30,20,10,20,30,35),
    marginTop : getResponsiveHeight(90,80,70,80,90,100)
  },
  outlineButton: {
    borderWidth: 1,
    width : wp(45),
    height : hp(6),
    justifyContent : "center",
    alignItems : "center",
    borderColor: '#2D2D2D',
    borderRadius: 8,
    backgroundColor: '#FFFCF3', 
  },
  outlineButtonText: {
    color: '#2D2D2D',
    fontSize: fontPercentage(16),
    fontWeight: '700',
  },
  filledButton: {
    marginLeft : widthPercentage(12),
    width : wp(45),
    height : hp(6),
    justifyContent : "center",
    alignItems : "center",
    backgroundColor: '#21103C', 
    borderRadius: 8,
    
  },
  filledButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  image: {
    width: wp(100),
    height: getResponsiveHeight(600,500,400,400,450,450),
    resizeMode : "contain"
  },
  title: {
    fontSize: fontPercentage(24),
    fontWeight: "700",
    textAlign: "center",
    marginTop: getResponsiveHeight(24,34,54,30,4,0),
  },
  text: {
    fontWeight: '500',
    color : "#7D7A6F",
    fontSize: fontPercentage(16),
    textAlign: "center",
    lineHeight : fontPercentage(24),
    letterSpacing: 0.57 / 100 * 16,
    marginTop : hp(1),
    
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: widthPercentage(8),
    height: heightPercentage(8),
    borderRadius: fontPercentage(50),
    marginHorizontal: widthPercentage(5),
  },
  activeDot: {
    backgroundColor: "black",
    width: widthPercentage(8),
    height: heightPercentage(8),
  },
  inactiveDot: {
    backgroundColor: "gray",
  },
});

export default OnboardingScreen;
