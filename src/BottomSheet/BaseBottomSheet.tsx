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
import MyBardetailListBottomSheet from "./MyBardetailListBottomSheet";
import axios from "axios";
import {API_BASE_URL} from "@env"
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginBottomSheet from "./LoginBottomSheetProps";

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

  //북마크 체크/해제를 위해 북마크 리스트를 맵으로 저장
  const [bookmarkListMap, setBookmarkListMap] = useState<Map<number, number>>(new Map());

  
  //나의 리스트 가져오기
  const[myList, setMyList] = useState([]);

  //북마크된 가게들 체크해서 bookmark_checked.png로 적용하기 위한 변수
  const [bookmarkIds, setBookmarkIds] = useState<Set<number>>(new Set());

  

  useEffect(() => {
    const fetchMyList = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if(!token){
          console.warn("로그인이 필요합니다.");
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/item/public/list`, {
          method: "GET",
          headers: {
            Authorization: `${token}`,
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
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) return;
  
        const response = await fetch(`${API_BASE_URL}/api/item/public/all`, {
          method: "GET",
          headers: { Authorization: `${token}` },
        });
  
        const result = await response.json();
        console.log("✅ 북마크 응답:", result);
  
        if (result.code === 1) {
          // ✅ 북마크 데이터 변환
          const transformed = result.data.map((bar) => ({
            id: bar.id,
            title: bar.bar_name,
            barAdress: bar.address,
            thumbNail: { uri: bar.thumbnail },
            hashtagList: bar.menus?.map((menu) => `#${menu.name}`) ?? [],
          }));
          setMyBars(transformed);
  
          result.data.forEach((bar, idx) => {
            console.log(`[${idx}] id=${bar.id}, name=${bar.bar_name}, addr=${bar.address}`);
          });

          console.log("result.data 예시", result.data[0]);

          // ✅ 북마크 ID Set 및 barId -> listId Map 구성
          const ids = new Set<number>();
          const map = new Map<number, number>();
  
          result.data.forEach((bar) => {
            ids.add(bar.id);
            if (bar.list_id !== undefined) {
              map.set(bar.id, bar.list_id);
            }
          });
  
          console.log("✅ 최종 map:", map);
          setBookmarkIds(ids);
          setBookmarkListMap(map);
        }
      } catch (error) {
        console.error("북마크 가게 불러오기 실패:", error);
      }
    };
  
    fetchBookmarkedBars();
  }, []);
  


  const [isLoginSheetVisible, setLoginSheetVisible] = useState(false);
  const [barData,setBarData] = useState([]);
  useEffect(() => {
    const fetchNearbyBars = async () => {
      
      try{
        const response = await axios.get(`${API_BASE_URL}/api/location/nearby?x=126.9812675&y=37.5718599`)
        if(response.data.code ===1){
          console.log("정상적으로 근처 칵테일바 데이터 접근 완료")
          const transformed = response.data.data.map((bar) => ({
            id: bar.id,
            title: bar.bar_name,                     
            barAdress: bar.address,                  
            thumbNail: { uri: bar.thumbnail },           
            hashtagList: bar.menus.map((m) => `#${m.name}`), 
          }));
          console.log(transformed);
          setBarData(transformed);
        }else
        console.log("서버 요청중 에러발생",response.data.msg);
      }catch(error){
        console.log("잘못된 접근", error);
      }
    }
    fetchNearbyBars();
  }, []);

const headerCheck = async () =>{
  const token = await AsyncStorage.getItem("accessToken");
  if(token){
    handleTabPress("myList")
  }else{
    setLoginSheetVisible(true);
  }
}

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
      return [{ title: "근처 칵테일 바", data: barData }];
    }
    return [
      { title: "나의 칵테일 바", data: myBars },
      { title: "근처 칵테일 바", data: barData },
    ];
  }, [selectedTab, barList, myBars, barData]);

  const handleTabPress = async (
    tab: "search" | "myList" | "region" | "bookmark" | "detail" | "pin" | "myBardetailList",
    bar = null
  ) => {
    if (tab === "bookmark") {
      const token = await AsyncStorage.getItem("accessToken");

      if(!token){
        setLoginSheetVisible(true);
        return;
      }else{
        console.log("북마크 할 bar id:", selectedBarId, selectedBar);
        setSelectedBarId(bar?.id ?? null);  // ✅ 리스트 저장용
        setSelectedBar(bar);                // ✅ UI 표시용 or Detail 화면용
      }
    }

    if (tab === "detail") {
      console.log("📦 handleTabPress로 전달된 bar:", bar);
      setSelectedBarId(bar?.id ?? null);
      setSelectedBar(bar); // ✅ 상세 바 정보 전달용
    }

    // setSelectedTab(prev => (prev === tab ? "search" : tab));
    setSelectedTab(tab);
  };

  const handleBookmarkToggle = async (barId: number) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      Alert.alert("로그인이 필요합니다.");
      return;
    }
  
    const listId = bookmarkListMap.get(barId);
    if (!listId) {
      console.warn("❌ listId가 없습니다 → API 호출 안함");
      Alert.alert("에러", "해당 가게의 리스트 정보가 없습니다.");
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/item`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ listId, barId }),
      });
  
      const result = await response.json();
      if (result.code === 1) {
        const newSet = new Set(bookmarkIds);
        newSet.delete(barId);
        setBookmarkIds(newSet);
  
        const newMap = new Map(bookmarkListMap);
        newMap.delete(barId);
        setBookmarkListMap(newMap);
  
        Alert.alert("북마크 해제", "리스트에서 삭제되었습니다.");
      } else {
        Alert.alert("실패", result.msg || "서버에서 북마크 해제 실패");
      }
    } catch (err) {
      console.error("북마크 해제 요청 실패:", err);
      Alert.alert("에러", "네트워크 오류 발생");
    }
  };
  

  return (
    <>
    <BottomSheet 
    ref={bottomSheetRef}
    index={0} 
    snapPoints={snapPoints} 
    animatedPosition={animatedPosition}
    enablePanDownToClose={false} 
    backgroundStyle={{ backgroundColor: theme.background }}
    containerStyle={{ position: 'absolute', zIndex: 100 }}>
    {selectedTab !== "detail" && selectedTab !== "search" && selectedTab !== "bookmark" &&(
      /* 네비게이션 버튼 */
      <View style={styles.sheetHeader}>
        <TouchableOpacity
          style={[styles.listButton, selectedTab === "myList" && styles.activeButton]}
          onPress={() => headerCheck()}
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
          const token = await AsyncStorage.getItem('accessToken');
          if(!token){
            Alert.alert("로그인이 필요합니다.");
            return;
          }
          const response = await fetch(`${API_BASE_URL}/api/item`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
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
            barId={selectedBar?.id}
            bookmarkIds={bookmarkIds}
            setBookmarkIds={setBookmarkIds}
            bookmarkListMap={bookmarkListMap}
            setBookmarkListMap={setBookmarkListMap}
            />
      ) : (
      <SearchSheetContent
      sections={sections}
      showMyBars={true}
      handleTabPress={handleTabPress}
      setSelectedTab={setSelectedTab}
      setSelectedBarId={setSelectedBarId}
      bookmarkIds={bookmarkIds}
      setBookmarkIds={setBookmarkIds}
      bookmarkListMap={bookmarkListMap}
      setBookmarkListMap={setBookmarkListMap}
      handleBookmarkToggle={handleBookmarkToggle}
  />
)}
    </BottomSheet>
     <LoginBottomSheet
      isVisible={isLoginSheetVisible}
      onClose={() => setLoginSheetVisible(false)}
      onLogin={() => {
        setLoginSheetVisible(false);
        navigation.navigate("Login");
      }}
    />
  </>
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