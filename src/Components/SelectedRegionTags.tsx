import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView,Image } from "react-native";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";

interface SelectedRegionTagsProps {
  selectedRegions: string[];
  onRemoveRegion: (region: string) => void;
  onRemoveAllRegions: () => void;
}

const SelectedRegionTags: React.FC<SelectedRegionTagsProps> = ({ selectedRegions, onRemoveRegion }) => {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
          {/* 초기화 버튼 */}
          <TouchableOpacity onPress={() => setSelectedRegions([])} >
          <Image source={require("../assets/drawable/reset.png")} style={styles.resetIcon} />
          </TouchableOpacity>
    
          {/* 선택된 지역 태그 리스트 */}
          {selectedRegions.map((region, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{region}</Text>
              <TouchableOpacity onPress={() => onRemoveRegion(region)} style={styles.removeButton}>
                <Text style={styles.removeText}>✖</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      );
    };

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: widthPercentage(10),
    marginTop: heightPercentage(10),
  },
  tag: {
    height : heightPercentage(36),
    flexDirection: "row",
    backgroundColor: "#F3EFE6",
    borderRadius: widthPercentage(20),
    paddingVertical: heightPercentage(6),
    paddingHorizontal: widthPercentage(12),
    marginRight: widthPercentage(8),
    alignItems: "center",
  },
  resetIcon : {
      width: widthPercentage(44), 
      height: heightPercentage(36), 
      resizeMode: "contain",
      marginRight : widthPercentage(8)
  },
  tagText: {
    fontSize: fontPercentage(14),
    color: "#333",
    marginRight: widthPercentage(5),
  },
  removeButton: {
    backgroundColor: "#E4DFD8",
    borderRadius: widthPercentage(12),
    padding: widthPercentage(4),
  },
  removeText: {
    fontSize: fontPercentage(12),
    color: "#666",
  },
});

export default SelectedRegionTags;
