import React, { useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import theme from "../assets/styles/theme";
import SearchSheetContent from "../BottomSheet/SearchSheetContent";
import MyListSheetContent from "../BottomSheet/MyListSheetContent";
import SelectionListSheet from "./\bSelectionListSheet";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import { useNavigation } from "@react-navigation/native"; 

const myBars = [
  {
    listId: 1,
    title: "Label",
    barAdress: "거리",
    image: require("../assets/drawable/barExample.png"),
    hashtageList: ["#칵테일명", "#칵테일명", "#다른주류명", "#안주명"],
  },
];

const nearBars = [
  {
    listId: 1,
    title: "Label",
    barAdress: "거리",
    image: require("../assets/drawable/barExample.png"),
    hashtageList: ["#칵테일명", "#칵테일명", "#다른주류명", "#안주명"],
  },
];
const myList = [
  {
    id: "1",
    name: "메인 컨셉",
    location: "999",
    tags: ["#Sub", "#Sub", "#Sub"],
    icon: require("../assets/drawable/listicon1.png"),
  },
  {
    id: "2",
    name: "메인 컨셉",
    location: "999",
    tags: ["#Sub", "#Sub", "#Sub"],
    icon: require("../assets/drawable/listicon2.png"),
  },
  {
    id: "3",
    name: "메인 컨셉",
    location: "999",
    tags: ["#Sub", "#Sub", "#Sub"],
    icon: require("../assets/drawable/listicon3.png"),
  },
];

const BaseBottomSheet = () => {
  const navigation = useNavigation();
  const snapPoints = useMemo(() => ["10%", "30%", "76%"], []);
  const [showMyBars, setShowMyBars] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"search" | "myList" | "region" | "bookmark">("search");
  const [selectedBar, setSelectedBar] = useState(null);

  // sections 데이터 변경
  const sections = useMemo(() => {
    if (selectedTab === "myList") {
      return [{ title: "나의 칵테일 바", data: myBars }];
    } else if (selectedTab === "region") {
      return [{ title: "근처 칵테일 바", data: nearBars }];
    }
    return [
      { title: "나의 칵테일 바", data: myBars },
      { title: "근처 칵테일 바", data: nearBars }
    ];
  }, [selectedTab]);

  // 탭 변경 핸들러
  const handleTabPress = (tab: "search" | "myList" | "region" | "bookmark", bar = null) => {
    if (tab === "bookmark") {
      setSelectedBar(bar);
    }
    setSelectedTab(prev => (prev === tab ? "search" : tab));
  };
  

  return (
    <BottomSheet index={0} snapPoints={snapPoints} enablePanDownToClose={false} backgroundStyle={{ backgroundColor: theme.background }}>
      
      {/* 네비게이션 버튼 */}
      <View style={styles.sheetHeader}>
        <TouchableOpacity
          style={[styles.listButton, selectedTab === "myList" && styles.activeButton]}
          onPress={() => handleTabPress("myList")}
        >
          <Text style={[styles.listText, selectedTab === "myList" && styles.activeText]}>나의 리스트</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.listButton, selectedTab === "region" && styles.activeButton]}
          onPress={() => navigation.navigate("RegionSelectScreen")}
        >
          <Text style={[styles.listText, selectedTab === "region" && styles.activeText]}>지역</Text>
        </TouchableOpacity>
      </View>

      {selectedTab === "bookmark" ? (
        <SelectionListSheet
          title="선택한 장소 명"
          listData={myList}
          onClose={() => setSelectedTab("search")}
          onSave={(selectedItem) => console.log("선택한 아이템:", selectedItem)}
        />
      ) : selectedTab === "myList" ? (
        <MyListSheetContent />
      ) : (
        <SearchSheetContent sections={sections} showMyBars={true} handleTabPress={handleTabPress} />
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetHeader: {
    backgroundColor: "#FFFCF3",
    paddingHorizontal: widthPercentage(16),
    paddingVertical: heightPercentage(8),
    flexDirection: "row",
  },
  listButton: {
    borderRadius: 20,
    backgroundColor: "#F3EFE6",
    alignSelf: "flex-start",
    paddingVertical: heightPercentage(8),
    paddingHorizontal: widthPercentage(12),
    marginRight: 10,
  },
  activeButton: {
    backgroundColor: "#21103C",
  },
  listText: {
    color: "#7D7A6F",
    fontSize: fontPercentage(14),
    textAlign: "center",
  },
  activeText: {
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});

export default BaseBottomSheet;
