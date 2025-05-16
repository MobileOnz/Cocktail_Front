import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Platform, Image} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../Navigation/Navigation";
import { widthPercentage, heightPercentage, fontPercentage, getResponsiveHeight } from "../assets/styles/FigmaScreen";
import theme from "../assets/styles/theme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const regions = [
  "서울 전체", "강남/신논현/양재", "청담/압구정/신사", "선릉/삼성", "논현/반포/학동",
  "서초/교대/방배", "대치/도곡/한티", "홍대/합정/신촌", "서울역/명동/회현",
  "잠실/석촌/천호", "신당/왕십리", "뚝섬/성수/서울숲/건대입구", "종로/을지로/충정로",
  "마곡/화곡/목동", "영등포/여의도/노량진", "미아/도봉/노원", "이태원/용산/삼각지",
  "서울대/사당/동작", "은평/상암", "신도림/구로", "마포/공덕", "금천/가산", "수서/복정/장지"
];


type NavigationProps = StackNavigationProp<RootStackParamList, "RegionSelectScreen">;

const RegionSelectScreen = () => {
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const navigation = useNavigation<NavigationProps>();

  const toggleRegion = (region: string) => {
    if (region === "서울 전체") {
      setSelectedRegions((prev) => (prev.includes(region) ? [] : [...regions]));
    } else {
      setSelectedRegions((prev) =>
        prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
      );
    }
  };

  const resetSelection = () => {
    setSelectedRegions([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 네비게이션 바 */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.title}>지역</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image style={styles.closeText} source={require("../assets/drawable/region_select_header_close.png")}/>
        </TouchableOpacity>
      </View>

        {/* 지역 리스트 */}
      <View style={styles.ContentContainer}>
      <View style={styles.categorySection}>
      <Text style={styles.categoryTitle}>서울</Text>
    </View>
      <FlatList
        data={regions}
        keyExtractor={(item) => item}
        contentContainerStyle={{
          paddingBottom: selectedRegions.length > 0 ? getResponsiveHeight(240,240,240,240,245,255) : getResponsiveHeight(145,145,145,170,180,210), // 태그 영역 존재하면 공간 확보
        }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.listItem} onPress={() => toggleRegion(item)}>
            <Text style={[styles.itemText, selectedRegions.includes(item) && styles.itemCheckText]}>
              {item}
            </Text>
            <TouchableOpacity
              onPress={() => toggleRegion(item)}
            >
              <Image
                style={styles.checkIcon}
                source={
                  selectedRegions.includes(item)
                    ? require("../assets/drawable/checked_true.png")
                    : require("../assets/drawable/checked_false.png")
                }
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}        
      />
      </View>
      

      {/* 선택된 지역 태그 */}
      {selectedRegions.filter((region) => region !== "서울 전체").length > 0 && (
    <View style={styles.tagWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagScroll}
      >
        {selectedRegions
          .filter((region) => region !== "서울 전체")
          .map((region, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{region}</Text>
              <TouchableOpacity onPress={() => toggleRegion(region)}>
                <Image style={styles.removeIcon} source={require("../assets/drawable/region_tag_close.png")}/>
              </TouchableOpacity>
            </View>
          ))}
      </ScrollView>
    </View>
  )}

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetSelection}>
          <Text style={styles.resetButtonText}>↻ 초기화</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => {
            const filteredRegions = selectedRegions.filter((region) => region !== "서울 전체");

            setSelectedRegions([]);
            navigation.navigate("BottomTabNavigator", {
              screen: "지도",
              params: { selectedRegions: filteredRegions, //지역 선택 및 초기화 함수 넘기기 
                resetRequested: true  
               } 
            } as any);
          }}
        >
          <Text style={styles.buttonText}>적용하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FFFCF3",
    
  },
  tagWrapper: {
    position: "absolute",
    bottom: getResponsiveHeight(84,94,104,80,85,95),
    left: 0,
    right: 0,
    backgroundColor: "#FFFCF3",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: "#E4DFD8",
    zIndex: 10,
  },
  tagScroll: {
    flexDirection: "row",
    alignItems: "center",
  },

  RegiondataList : {
    flexDirection : "row"
  },
  ContentContainer: {
    flexDirection: "row", // 왼쪽(카테고리) + 오른쪽(리스트) 정렬
    backgroundColor: "#FFFCF3", // 전체 배경색
  },
  categorySection: {
    width: widthPercentage(105), 
    backgroundColor: "#EDE7DD", 
    alignItems: "center",
  },
  categoryTitle: {
    paddingHorizontal : widthPercentage(35),
    paddingVertical : heightPercentage(9),
    width : widthPercentage(105), 
    height : heightPercentage(40),
    fontSize: fontPercentage(14),
    fontWeight: "bold",
    color: "#2D2D2D",
    backgroundColor : theme.background
  },


  // 상단 네비게이션 바
  header: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingTop: getResponsiveHeight(30,30,30,40,50,60), 
  paddingHorizontal: widthPercentage(16), 
  paddingBottom: heightPercentage(12), 
  backgroundColor: "#FFFCF3", 
  borderBottomColor: "#EEE",
  borderBottomWidth: 1,
},
  title: { fontSize: 18, 
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  
  },
  placeholder: {
    width: widthPercentage(24), // 오른쪽 아이콘과 동일한 폭
    height: heightPercentage(24),
  },
  closeText: {
    width: widthPercentage(24),
    height: heightPercentage(24),
    marginTop : heightPercentage(8),
  },

  // 리스트 스타일
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor : "#FFFCF3",
    borderBottomWidth: 1,
    borderColor: "#EEE",
    alignItems: "center",
  },
  itemCheckText: { 
    fontSize: fontPercentage(14),
    color : "#21103C",
    fontWeight : "500",
  },
  itemText: { 
    fontSize: fontPercentage(14),
    color : "#B9B6AD",
    fontWeight : "500",
  },
  checkIcon: {
    width: widthPercentage(20),
    height: heightPercentage(20),
    resizeMode: "contain",
  },

  // 선택된 지역 태그 스타일
  tagContainer: {
    backgroundColor : "#FFFCF3",
    height : 52,
    flexDirection: "row",
    paddingHorizontal: 16,
    marginVertical: 10,
    marginLeft : 16,
    marginRight : 8,
    marginHorizontal : 8,
  },
  tag: {
    flexDirection: "row",
    backgroundColor: "#FFFCF3",
    borderRadius: 20,
    borderWidth : 1,
    borderColor : "#B9B6AD",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    alignItems: "center",
  },
  tagText: {
    fontSize: fontPercentage(14),
    color: "#2D2D2D",
    fontWeight : "500",
    marginRight: widthPercentage(5),
    marginHorizontal : heightPercentage(8)
  },

  removeIcon: {
    width: widthPercentage(20),
    height: heightPercentage(20),
  },

  // 하단 버튼 스타일
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: widthPercentage(16),
    paddingVertical: heightPercentage(12),
    paddingBottom:  getResponsiveHeight(14,44,44,20,24,34),
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderColor: "#E4DFD8",
    position: "absolute",  // 하단 고정
    bottom: 0,
    width: "100%",
  },
  resetButton: {
    width : wp(30),
    height : hp(6),
    paddingHorizontal : widthPercentage(16),
    paddingVertical : getResponsiveHeight(13,16,16,10,11,12),

    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#E4DFD8",
    marginRight: 8,
  },
  applyButton: {
    width : wp(60),
    height : hp(6),
   paddingVertical : getResponsiveHeight(13,16,16,10,11,13),
   alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#21103C",
  },
  resetButtonText: {
   
    fontWeight : "700",
    fontSize : fontPercentage(16),
    color : "#7D7A6F",
  },
  buttonText: { 
    fontSize: fontPercentage(16),
    fontWeight : "700",
    color: "#FFF" },
});

export default RegionSelectScreen;
