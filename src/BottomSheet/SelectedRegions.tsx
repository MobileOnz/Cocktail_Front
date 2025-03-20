import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";

const SelectedRegions = ({ selectedRegions, onRegionSelect }) => {
  return (
    <BottomSheetScrollView style={styles.headerContainer}>
      {/* 드래그 핸들 */}
      <View style={styles.handle} />

      {/* 선택된 지역 탭 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionScroll}>
        {selectedRegions.map((region, index) => (
          <TouchableOpacity key={index} onPress={() => onRegionSelect(region)}>
            <Text style={[styles.regionText, index === 0 && styles.selectedRegion]}>
              {region}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </BottomSheetScrollView>
  );
};

export default SelectedRegions;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#FFFCF3",
    paddingTop: heightPercentage(10),
    paddingBottom: heightPercentage(8),
    borderTopLeftRadius: widthPercentage(12),
    borderTopRightRadius: widthPercentage(12),
    alignItems: "center",
  },
  handle: {
    width: widthPercentage(40),
    height: heightPercentage(4),
    backgroundColor: "#B9B6AD",
    borderRadius: widthPercentage(2),
    marginBottom: heightPercentage(8),
  },
  regionScroll: {
    flexDirection: "row",
    paddingHorizontal: widthPercentage(16),
  },
  regionText: {
    fontSize: fontPercentage(12),
    color: "#B9B6AD",
    fontWeight: "500",
    marginRight: widthPercentage(16),
  },
  selectedRegion: {
    color: "#21103C", // 선택된 지역은 진한 보라색
    fontWeight: "bold",
  },
});
