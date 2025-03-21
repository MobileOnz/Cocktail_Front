import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";

type LoadingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "LoadingScreen"
>;

interface Props {
  navigation: LoadingScreenNavigationProp;
}

const LoadingScreen: React.FC<Props> = ({ navigation }) => {
  const [loadingDots, setLoadingDots] = useState(".");

  useEffect(() => {
    // 3초 후 결과 화면으로 이동
    const timeout = setTimeout(() => {
      navigation.navigate("ResultScreen");
    }, 3000);

    // 0.4초마다 "..." 애니메이션 효과
    const interval = setInterval(() => {
      setLoadingDots((prev) => (prev.length === 3 ? "." : prev + "."));
    }, 400);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>
        (닉네임)님만을 위한{"\n"}칵테일을 만들고 있어요{loadingDots}
      </Text>
      <Image
        source={require("../assets/drawable/cocktail_making.png")}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fffcf3",
  },
  loadingText: {
    fontSize: fontPercentage(18),
    fontWeight: "bold",
    color: "#2D2D2D",
    marginBottom: heightPercentage(20),
    textAlign: "center",
  },
  image: {
    width: widthPercentage(260),
    height: heightPercentage(260),
  },
});

export default LoadingScreen;
