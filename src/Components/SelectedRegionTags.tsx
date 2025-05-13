import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView,Image } from "react-native";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import {useToast} from '../Components/ToastContext';


interface SelectedRegionTagsProps {
  selectedRegions: string[];
  onRemoveRegion: (region: string) => void;
  onRemoveAllRegions: () => void;
  activeRegion: string | null;
}

const SelectedRegionTags: React.FC<SelectedRegionTagsProps> = ({ selectedRegions, onRemoveRegion, onRemoveAllRegions,activeRegion}) => {
   const {showToast} = useToast();
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
          {/* 초기화 버튼 */}
          <TouchableOpacity onPress={() => onRemoveAllRegions()}>
          <Image source={require("../assets/drawable/reset.png")} style={styles.resetIcon} />
          </TouchableOpacity>
    
          {/* 선택된 지역 태그 리스트 */}
          {selectedRegions.map((region, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{region}</Text>
              <TouchableOpacity onPress={() => {
                if(region === activeRegion){
                  showToast("활성화된 지역입니다.")
                }else{
                  onRemoveRegion(region)
                }
                }} style={styles.removeButton}>
                <Image style={styles.removeIcon} source={require("../assets/drawable/region_tag_close.png")}/>
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
    height: heightPercentage(36),
    flexDirection: "row",
    backgroundColor: "#F3EFE6",
    borderRadius: widthPercentage(20),
    paddingVertical: heightPercentage(6),
    paddingHorizontal: widthPercentage(12),
    marginRight: widthPercentage(8),
    alignItems: "center",
  
    // 💡 Drop Shadow 설정 (iOS)
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  
    // 💡 Drop Shadow 설정 (Android)
    elevation: 4,
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
    backgroundColor: "#f3efe6",
    borderRadius: widthPercentage(12),
    padding: widthPercentage(4),
  },
  removeIcon: {
    width: widthPercentage(20),
    height: heightPercentage(20),
  },
});

export default SelectedRegionTags;
