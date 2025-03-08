import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import theme from "../assets/styles/theme";

const SearchBar = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.searchButton}
      onPress={() => navigation.navigate("SearchScreen" as never)}
    >
      <Text style={styles.searchButtonText}>검색</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  searchButton: {
    position: "absolute",
    top: heightPercentage(59),
    width: widthPercentage(343),
    alignSelf: "center",
    height: heightPercentage(48),
    borderRadius: widthPercentage(8),
    backgroundColor: "#FFFCF3",
    justifyContent: "center",
    paddingHorizontal: widthPercentage(10),
    zIndex: 2,
  },
  searchButtonText: {
    fontSize: fontPercentage(16),
    color: "#999",
  },
});

export default SearchBar;
