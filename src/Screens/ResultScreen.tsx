import React, {useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import Icon from "react-native-vector-icons/Ionicons";

import { API_BASE_URL } from "@env";
type NavigationProps = StackNavigationProp<RootStackParamList, "ResultScreen">;

const ResultScreen: React.FC = ({route}) => {
  const navigation = useNavigation<NavigationProps>();

  const { cocktailImage, cocktailName, cocktailDescription, nickname } = route.params;


  const [notFound, setNotFound] = useState(false);




  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image source={require("../assets/drawable/left-chevron.png")} style={styles.icon}/>
      </TouchableOpacity>

      <Text style={styles.resultText}>{nickname}님,{'\n'}당신을 위한 칵테일이 준비되었어요.</Text>

      <Image
        source={
          cocktailImage
            ? { uri: cocktailImage }
            : require("../assets/drawable/cocktail_sample.png")
        }
        style={styles.cocktailImage}
      />

      <Text style={styles.cocktailName}>{notFound ? "추천 칵테일 없음" : cocktailName}</Text>
      <Text style={styles.cocktailDescription}>{notFound ? "앗! 아직 준비된 칵테일이 없어요\n다른 조합으로 다시 추천 받아보세요!" : cocktailDescription}</Text>

      <TouchableOpacity 
        style={styles.mainButton}
        onPress={() => navigation.navigate("SearchScreen", {initialKeyword: cocktailName})}
        >
        <Text 
          style={styles.mainButtonText}>해당 메뉴가 있는 가게 찾기
          </Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => navigation.navigate("RecommendationFlow")}
        >
          <Text style={styles.smallButtonText}>다시 찾기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButton} onPress={() => navigation.navigate("BottomTabNavigator")}
        >
          <Text style={styles.smallButtonText}>홈으로</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fffcf3",
  },
  icon: {
    width: widthPercentage(28),
    height: widthPercentage(28),
  },
  backButton: {
    position: "absolute",
    top: heightPercentage(50),
    left: widthPercentage(15),
  },
  backButtonText: {
    fontSize: fontPercentage(24),
    color: "#000",
  },
  resultText: {
    fontSize: fontPercentage(16),
    fontWeight: "500",
    marginTop: heightPercentage(20),
    textAlign: "center",
    letterSpacing: -0.02,
    lineHeight: fontPercentage(26),
  },
  cocktailImage: {
    width: widthPercentage(240),
    height: heightPercentage(260),
    borderRadius: 15,
    marginTop: heightPercentage(20),
  },
  cocktailName: {
    height: heightPercentage(48),
    fontSize: fontPercentage(16),
    fontWeight: "500",
    marginTop: heightPercentage(48),
    color: "#2D2D2D",
  },
  cocktailDescription: {
    height: heightPercentage(48),
    fontSize: fontPercentage(14),
    color: "#7D7A6F",
    marginTop: heightPercentage(10),
    marginHorizontal: widthPercentage(20),
    textAlign: "center",
  },
  mainButton: {
    width: widthPercentage(343),
    height: heightPercentage(48),
    backgroundColor: "#21103C",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: heightPercentage(20),
  },
  mainButtonText: {
    fontSize: fontPercentage(16),
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: widthPercentage(343),
    marginTop: heightPercentage(10),
  },
  smallButton: {
    width: widthPercentage(165),
    height: heightPercentage(48),
    borderColor: "#D9D9D9",
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  smallButtonText: {
    fontSize: fontPercentage(16),
    color: "#2D2D2D",
  },
});
