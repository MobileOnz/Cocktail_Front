import React from "react";
import { View, Text, TouchableOpacity, StyleSheet,Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";

const SearchBar = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.searchButton}
      onPress={() => navigation.navigate("SearchScreen" as never)}
    >
      <View style={{flexDirection : "row",  alignItems: "center"}}>
        <Image source={require("../assets/drawable/search.png")}
          style={{width : widthPercentage(24), height : heightPercentage(24), marginRight : widthPercentage(10), marginTop : heightPercentage(2)}}
          resizeMode="contain"
        />
      <Text style={styles.searchButtonText}>가게 또는 메뉴명을 입력하세요</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  searchButton: {
    position: "absolute",
    top: heightPercentage(5),
    width: widthPercentage(343),
    alignSelf: "center",
    height: heightPercentage(48),
    borderRadius: widthPercentage(8),
    backgroundColor: "#FFFCF3",
    justifyContent: "center",
    paddingHorizontal: widthPercentage(10),
    zIndex: 2,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,  },
    shadowOpacity: 0.08,
    shadowRadius: 4,
   elevation: 4,  
  },
  searchButtonText: {
    fontSize: fontPercentage(16),
    color: "#999",
  },
});

export default SearchBar;
