import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
  Easing,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";
import {
  widthPercentage,
  heightPercentage,
  fontPercentage,
} from "../assets/styles/FigmaScreen";

type RecommendationIntroScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RecommendationIntro"
>;

interface Props {
  navigation: RecommendationIntroScreenNavigationProp;
}

const RecommendationIntroScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const buttonScale = useRef(new Animated.Value(1)).current;


  const handlePress = () => { //버튼 애니메이션 (누르면 움츠려들었다가 펴지는거)
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.9, // 버튼 축소
          duration: 100, 
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        navigation.navigate("RecommendationFlow");
      });
    };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Image
          source={require("../assets/drawable/left-chevron.png")}
          style={styles.icon}
        />
      </TouchableOpacity>

      {/* 설명 텍스트 (페이드인 애니메이션) */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.description}>
          오늘, 당신의 기분과 취향을 알려주세요.{"\n"}
          완벽한 한 잔을 준비할게요.
        </Text>
      </Animated.View>

      {/* 칵테일 이미지 */}
      <Image
        source={require("../assets/drawable/cocktail_draw.png")}
        style={styles.cocktailImage}
      />

      {/* 버튼 */}
      <Animated.View style = {[styles.animatedButtonWrapper, { transform: [{ scale: buttonScale}] }]}>
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handlePress}
      >
        <Text style={styles.confirmButtonText}>나를 위한 칵테일 찾아보기</Text>
      </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default RecommendationIntroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFCF3",
  },
  backButton: {
    position: "absolute",
    top: heightPercentage(50),
    left: widthPercentage(15),
    alignItems: "center",
    justifyContent: "center",
    width: widthPercentage(40),
    height: heightPercentage(40),
    // backgroundColor: "rgba(255, 0, 0, 0.3)", // 🔥 터치 영역 확인용 (빨간색 반투명)
    // borderWidth: 1, 
    // borderColor: "red",
  },
  icon: {
    width: widthPercentage(28),
    height: widthPercentage(28),

  },
  description: {
    width: widthPercentage(375),
    fontSize: fontPercentage(18),
    lineHeight: fontPercentage(26),
    fontWeight: "500",
    textAlign: "center",
    paddingVertical: heightPercentage(12),
    paddingHorizontal: widthPercentage(16),
    marginTop: heightPercentage(150),
  },
  cocktailImage: {
    width: widthPercentage(260),
    height: heightPercentage(260),
    borderRadius: 8,
    marginVertical: heightPercentage(20),
  },
  confirmButton: {
    width: widthPercentage(344),
    height: heightPercentage(48),
    backgroundColor: "#21103C",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: heightPercentage(20),
    paddingVertical: heightPercentage(4),
    paddingHorizontal: widthPercentage(16),
  },
  confirmButtonText: {
    fontSize: fontPercentage(16),
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
