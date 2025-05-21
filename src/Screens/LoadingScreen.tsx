import React, { useEffect} from "react";
import { View, Text, Image, StyleSheet, Platform } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../Navigation/Navigation";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";

import { API_BASE_URL } from "@env";

import LottieView from "lottie-react-native";
import instance from "../tokenRequest/axios_interceptor";

type LoadingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "LoadingScreen"
>;

interface Props {
  navigation: LoadingScreenNavigationProp;
}

const LoadingScreen: React.FC<Props> = ({ navigation, route }) => {
  

  const { alcholType, tasteCategoryId, tasteDetailId, nickname } = route.params;

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     navigation.navigate("ResultScreen", { alcholType, tasteCategoryId, tasteDetailId, nickname});
  //   }, 3000);

  //   return () => {
  //     clearTimeout(timeout);
  //   };
  // }, []);

  useEffect(() => {
    const fetchAndNavigate = async () => {
      try {
        const res = await instance.get("/api/public/cocktail/personalize", {
            params: {
              tasteCategoryId,
              tasteDetailid: tasteDetailId, 
              alcholType,                   
            },
          });

          const result = res.data;
  
        if (result.code === 1 && result.data?.cocktail) {
          const cocktailId = result.data.cocktail.id;
          const cocktailName = result.data.cocktail.cocktail_name;
          const cocktailDescription = result.data.cocktail.introduce;
  
          const detailRes = await fetch(`${API_BASE_URL}/api/public/cocktail?cocktailId=${cocktailId}`);
          const detailData = await detailRes.json();
          const cocktailImage = detailData.data?.cocktail?.image_url ?? "";

          const timeout = setTimeout(() => {
            navigation.navigate("ResultScreen", {
              cocktailImage,
              nickname,
              cocktailName,
              cocktailDescription,
            });
          }, 3000);
          return () => {
            clearTimeout(timeout);
          };
        }
      } catch (e) {
        console.error("에러:", e);
        navigation.navigate("ResultScreen", { notFound: true, nickname });
      }
    };
  
    fetchAndNavigate();
  }, []);

  
  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>
        {nickname}님만을 위한{"\n"}칵테일을 만들고 있어요.
      </Text>
      {Platform.OS === "ios" ? (
        <Image
          source={require("../assets/drawable/cocktail_waiting.gif")}
          style={styles.image}
          resizeMode="contain"
        />
      ) : (
        <LottieView
          source={require("../assets/drawable/recommend_complete.json")}
          autoPlay
          loop
          style={styles.image}
        />
      )}

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
