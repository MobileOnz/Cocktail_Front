import React, { useMemo, useState,useRef,useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import theme from "../assets/styles/theme";
import SearchSheetContent from "../BottomSheet/SearchSheetContent";
import MyListSheetContent from "../BottomSheet/MyListSheetContent";
import SelectionListSheet from "./SelectionListSheet";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import { useNavigation } from "@react-navigation/native"; 
import MenuListDetail from "./MenuListDetail";
import PinClickView from "./PinClickView";
import MyBardetailListBottomSheet from "./MyBardetailListBottomSheet";

import { API_BASE_URL } from "@env";
const myBars = [
  {
    listId: 1,
    title: "Label",
    barAdress: "거리",
    image: require("../assets/drawable/barExample.png"),
    hashtageList: ["#칵테일명", "#칵테일명", "#다른주류명", "#안주명"],
  },
  {
    listId: 2,
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


const BaseBottomSheet = ({ 
  animatedPosition, 
  barList, 
  setBarList, 
  selectedTab, 
  setSelectedTab 
  }) => {
  const navigation = useNavigation();
  const snapPoints = useMemo(() => ["10%", "30%", "76%"], []);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [selectedBar, setSelectedBar] = useState<"search" | "myList" | "region" | "bookmark"| "detail"|"myBardetailList">("search");
  const [selectedBarId, setSelectedBarId] = useState<number | null>(null);

  //나의 리스트 가져오기
  const[myList, setMyList] = useState([]);

  useEffect(() => {
    const fetchMyList = async () => {
      try {
        const token = "your_access_token_here"; // 실제로는 context나 secure storage에서 가져오기
        const response = await fetch(`${API_BASE_URL}/api/item/public/list`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (result.code === 1) {
          setMyList(result.data);
        } else {
          console.warn("리스트 불러오기 실패:", result.msg);
        }
      } catch (error) {
        console.error("리스트 가져오기 실패:", error);
      }
    };
  
    fetchMyList();
  }, []);

  //북마크된 가게 불러오기위한 변수
  const [myBars, setMyBars] = useState([]);

  //북마크 가게 불러오기
  useEffect(() => {
    const fetchBookmarkedBars = async () => {
      try {
        const token = "your_access_token_here"; // 실제론 context나 secure storage에서 가져오기
        const response = await fetch(`${API_BASE_URL}/api/item/public/all`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const result = await response.json();
        if (result.code === 1) {
          setMyBars(result.data);
        } else if (result.code === -1) {
          console.warn("로그인이 필요합니다");
        }
      } catch (error) {
        console.error("북마크 가게 불러오기 실패:", error);
      }
    };
  
    fetchBookmarkedBars();
  }, []);

  
  useEffect(() => {
    if (selectedTab === "detail") {
      bottomSheetRef.current?.expand();
    }
  }, [selectedTab]);

  // ✅ sections 설정
const sections = useMemo(() => {
    if (selectedTab === "search" && barList.length > 0) {
      return [{ title: "검색 결과", data: barList }];
    } else if (selectedTab === "myList") {
      return [{ title: "나의 칵테일 바", data: myBars }];
    } else if (selectedTab === "region") {
      return [{ title: "근처 칵테일 바", data: nearBars }];
    }
    return [
      { title: "나의 칵테일 바", data: myBars },
      { title: "근처 칵테일 바", data: nearBars },
    ];
  }, [selectedTab, barList, myBars]);

  // 탭 변경 핸들러
  const handleTabPress = (tab: "search" | "myList" | "region" | "bookmark" | "detail"|"pin"|"myBardetailList", bar = null) => {
    if (tab === "bookmark") {
      setSelectedBarId(bar?.id ?? null);
    }
    setSelectedTab(prev => (prev === tab ? "search" : tab));
  };

  return (
    
    <BottomSheet 
    ref={bottomSheetRef}
    index={0} 
    snapPoints={snapPoints} 
    animatedPosition={animatedPosition}
    enablePanDownToClose={false} 
    backgroundStyle={{ backgroundColor: theme.background }}
    containerStyle={{ position: 'absolute', zIndex: 100 }}>
    {selectedTab !== "detail" && selectedTab !== "search" &&(
      /* 네비게이션 버튼 */
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
    )}

          {/* 클릭시 이동 */}
      {selectedTab === "bookmark" ? (
      <SelectionListSheet
      title="선택한 장소 명"
      listData={myList}
      onClose={() => setSelectedTab("search")}
      onSave={async (selectedItem) => {
        if (!selectedItem || !selectedBarId) return;
      
        try {
          const token = "your_access_token_here"; // 실제로는 context 또는 SecureStorage 등에서
          const response = await fetch(`${API_BASE_URL}/api/item`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              listId: selectedItem.id,
              barId: selectedBarId,
            }),
          });
      
          const result = await response.json();
          if (result.code === 1) {
            Alert.alert("성공", "리스트에 가게를 추가했습니다.");
            setSelectedTab("search");
          } else {
            Alert.alert("실패", result.msg ?? "리스트 추가 실패");
          }
        } catch (error) {
          console.error("가게 추가 에러:", error);
          Alert.alert("에러", "네트워크 오류");
        }
      }}
      

      />
      ): selectedTab ==="myBardetailList" ? (
        <MyBardetailListBottomSheet listId={selectedBarId} />
      ) : selectedTab === "myList" ? (
          <MyListSheetContent 
            handleTabPress={(tab, bar) => {
              if (tab === "myBardetailList") {
                setSelectedBarId(bar.id); // 리스트 ID 설정
              }
              handleTabPress(tab, bar);
            }}
            bookmarkedBars={myBars} //실제 데이터 전달
            />
      ) : selectedTab === "detail" ? (
          <MenuListDetail 
            handleTabPress={handleTabPress}
            barId={selectedBarId}
            />
      ) : (
      <SearchSheetContent
      sections={sections}
      showMyBars={true}
      handleTabPress={handleTabPress}
      setSelectedTab={setSelectedTab}
      setSelectedBarId={setSelectedBarId}
  />
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