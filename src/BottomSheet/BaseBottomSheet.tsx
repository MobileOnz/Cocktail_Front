import React, { useMemo, useState,useRef,useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, StyleSheet, TouchableOpacity, Text, Alert, Platform} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import theme from "../assets/styles/theme";
import SearchSheetContent from "../BottomSheet/SearchSheetContent";
import MyListSheetContent from "../BottomSheet/MyListSheetContent";
import SelectionListSheet from "./SelectionListSheet";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import { useNavigation } from "@react-navigation/native"; 
import MenuListDetail from "./MenuListDetail";
import MyBardetailListBottomSheet from "./MyBardetailListBottomSheet";
import {API_BASE_URL} from "@env"
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginBottomSheet from "./LoginBottomSheetProps";
import SelectedRegions from "./SelectedRegions";
import MapView from "react-native-maps";
import axios from "axios";
import { useToast } from "../Components/ToastContext";
import { formatBarForMyList } from "../utils/formatBar";
import { Portal } from "react-native-paper";


const BaseBottomSheet = ({ 
  animatedPosition, 
  selectedRegions,
  barData,
  setBarData,
  barList, 
  setBarList, 
  selectedTab, 
  setSelectedTab,
  selectedBarId,
  setSelectedBarId,
  refreshTrigger,
  setRefreshTrigger,
  centerMapOnBar,
  onBarMarkerPress,
  setMarkerList,
  markerList,
  }) => {
  const navigation = useNavigation();
  const snapPoints = useMemo(() => ["19%", "38%", "85%"], []);
  
  const mapRef = useRef<MapView>(null);
  
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [selectedBar, setSelectedBar] = useState<"search" | "myList" | "region" | "bookmark"| "detail"|"myBardetailList">("search");

  //북마크 체크/해제를 위해 북마크 리스트를 맵으로 저장
  const [bookmarkListMap, setBookmarkListMap] = useState<Map<number, number>>(new Map());


  //토스트
  const {showToast} = useToast();

  //나의 리스트 가져오기
  const[myList, setMyList] = useState([]);

  //북마크된 가게들 체크해서 bookmark_checked.png로 적용하기 위한 변수
  const [bookmarkIds, setBookmarkIds] = useState<Set<number>>(new Set());

  const hasMappedRef = useRef(false);
  const isReady =
    Array.isArray(myList) && myList.length > 0 &&
    bookmarkListMap instanceof Map && bookmarkListMap.size > 0 &&
    Array.isArray(markerList) && markerList.length > 0;

  useEffect(() => {
    if (!isReady || hasMappedRef.current) return;

    console.log("🧩 icon_tag 매핑 시작 (isReady)");

    const enriched = markerList.map((marker) => {
      const listId = bookmarkListMap.get(marker.id);
      const iconTag = myList.find((list) => list.id === listId)?.icon_tag ?? 5;
      return {
        ...marker,
        icon_tag: iconTag,
      };
    });

    console.log("✅ enriched markerList:", enriched);
    setMarkerList(enriched);
    hasMappedRef.current = true;
  }, [isReady]); // 핵심은 단 하나의 트리거로
  

  const fetchMyList = useCallback(async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
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
}, []);

useFocusEffect(
  useCallback(() => {
    fetchMyList();
  }, [fetchMyList])
);

  //북마크된 가게 불러오기위한 변수
  const [myBars, setMyBars] = useState([]);

  useFocusEffect(
    useCallback(() => {
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
    }, [])
  );

  const [isLoginSheetVisible, setLoginSheetVisible] = useState(false);
  const [sheetReady, setSheetReady] = useState(false);
  // const [markerList, setMarkerList] = useState([]);

  //지역 선택시 조회
  useEffect(() => {
    const fetchNearbyBars = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/location/nearby?x=126.9812675&y=37.5718599`);
        if (response.data.code === 1) {
          const rawData = response.data.data;
  
          const formatted = rawData.map((bar) => ({
            id: bar.id,
            title: bar.bar_name,
            barAdress: bar.address,
            thumbNail: bar.thumbnail ? { uri: bar.thumbnail } : require("../assets/drawable/barExample.png"),
            hashtagList: bar.menus.map((m) => `#${m.name}`),
          }));
  
          const markers = rawData.map((bar) => ({
            id: bar.id,
            title: bar.bar_name,
            coordinate: {
              latitude: Number(bar.y),
              longitude: Number(bar.x),
            },
          }));
  
          setBarData(formatted);
          setMarkerList(markers);
          setSelectedTab("regionDetail");
  
          // 📍 지도 줌인
          setTimeout(() => {
            if (mapRef.current && markers.length > 0) {
              mapRef.current.fitToCoordinates(markers.map((m) => m.coordinate), {
                edgePadding: { top: 100, right: 100, bottom: 300, left: 100 },
                animated: true,
              });
            }
          }, 600);
        } else {
          console.log("서버 요청중 에러발생", response.data.msg);
        }
      } catch (error) {
        console.log("잘못된 접근", error);
      }
    };
  
    if (selectedRegions.length > 0) {
      fetchNearbyBars();
  
    } else {
      setSelectedTab("search");
    }
  }, [selectedRegions]);

  
const headerCheck = async () =>{
  const token = await AsyncStorage.getItem("accessToken");
  if(token){
    handleTabPress("myList")
  }else{
    setLoginSheetVisible(true);
  }
}

  useEffect(() => {
    if (selectedTab === "detail" && selectedBarId) {
      bottomSheetRef.current?.expand();
    }
  }, [selectedTab, selectedBarId]);

  const [sections, setSections] = useState([
    { title: "나의 칵테일 바", data: [] },
    { title: "근처 칵테일 바", data: [] },
  ]);
  
  // myBars, barData, barList 상태 변화 시 sections 업데이트
  useEffect(() => {
    if (selectedTab === "search" && barList.length > 0) {
      setSections([{ title: "검색 결과", data: barList }]);
    } else if (selectedTab === "myList") {
      setSections([{ title: "나의 칵테일 바", data: myBars }]);
    } else if (selectedTab === "region") {
      setSections([{ title: "근처 칵테일 바", data: barData }]);
    } else {
      setSections([
        { title: "나의 칵테일 바", data: myBars },
        { title: "근처 칵테일 바", data: barData },
      ]);
    }
  }, [selectedTab, barList, myBars, barData, refreshTrigger]);

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

        const barId = bar?.raw?.id ?? bar?.id ?? null;
        console.log("북마크 할 bar id:", selectedBarId, selectedBar);
        setSelectedBarId(barId);  // ✅ 리스트 저장용
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
  
        //myBars에서 북마크 제거
        setMyBars((prevBars) => prevBars.filter((bar) => bar.id !== barId));

        //sections 반영해서 북마크 해제된 가게 즉시 제거 후 업데이트
        setSections((prevSections) =>
          prevSections.map((section) =>
            section.title === "나의 칵테일 바"
              ? {
                  ...section,
                  data: section.data.filter((bar) => bar.id !== barId),
                }
              : section
          )
        );

        setRefreshTrigger(prev => prev + 1); //트리거 변경으로 sections 리렌더 유도
        showToast("리스트에서 삭제되었습니다.");
      } else {
        showToast("서버 오류");
      }
    } catch (err) {
      console.error("북마크 해제 요청 실패:", err);
      showToast("네트워크 오류");

    }
  };
  

  return (
    
    <>
        
        {selectedTab === "bookmark" && <View style={styles.dimmedBackground} />}
<BottomSheet
  ref={bottomSheetRef}
  index={0}
  snapPoints={snapPoints}
  animatedPosition={animatedPosition}
  onLayout={() => {
    setSheetReady(true);
  }}
  enablePanDownToClose={false}
  keyboardBlurBehavior="restore" 
  backgroundStyle={{ backgroundColor: theme.background }}
  containerStyle={{ position: 'absolute', zIndex: 100, ...(Platform.OS === "ios" && { marginTop: heightPercentage(40) }),}}
  //바텀시트 상단 마진 : containerStyle에 marginTop, 현재는 ios만 margin 준 상태
  //
>
  
{selectedTab !== "detail" && selectedTab !== "regionDetail" && (
  <View style={styles.sheetHeader}>
    <TouchableOpacity
      style={[styles.listButton, selectedTab === "myList" && styles.activeButton]}
      onPress={() => headerCheck()}
    >
      <Text style={[styles.listText, selectedTab === "myList" && styles.activeText]}>
        나의 리스트
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.listButton, selectedTab === "region" && styles.activeButton]}
      onPress={() => navigation.navigate("RegionSelectScreen")}
    >
      <Text style={[styles.listText, selectedTab === "region" && styles.activeText]}>
        지역
      </Text>
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

        console.log("🟢 onSave 호출됨 - 선택된 리스트:", selectedItem);
        console.log("🟢 selectedBarId:", selectedBarId);
        console.log("🟢 selectedBar(raw or formatted):", selectedBar);

        if (!selectedItem || !selectedBarId || !selectedBar){
          console.warn("❌ 저장할 값이 부족함 (selectedItem, selectedBarId, selectedBar)");
          return;
        } 
      
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
          console.log("북마크 추가 응답: ", result);

          if (result.code === 1) {
            showToast("가게를 추가했습니다.");
            setSelectedTab("search");

            //menuListDetail과의 바 데이터 포맷을 적용시켜주기 위함
            const formattedBar = formatBarForMyList(selectedBar.raw ?? selectedBar);

            //바로 북마크 Set, Map 업데이트
            setBookmarkIds((prev) => new Set(prev).add(selectedBarId));
            setBookmarkListMap((prev) => {
              const updated = new Map(prev);
              updated.set(selectedBarId, selectedItem.id);
              return updated;
            });

            
            //바로 myBars에 추가, 이미 있으면 중복 방지까지
            setMyBars((prevBars) => {
              const exists = prevBars.some((bar) => bar.id === selectedBarId);
              return exists ? prevBars : [...prevBars, formattedBar];
            });

            //sections에 추가 반영
            setSections((prevSections) => {
              const updatedSections = prevSections.map((sections) => {
                if(sections.title === "나의 칵테일 바"){
                  const exists = sections.data.some((bar) => bar.id === selectedBarId);
                  return exists
                    ? sections
                    : { ...sections, data: [...sections.data, formattedBar]};
                }
                return sections;
              });

              //혹시 "나의 칵테일 바" 섹션이 아예 없을 경우
              const hasMyBarSection = updatedSections.some(
                (section) => section.title === "나의 칵테일 바"
              );
              if(!hasMyBarSection){
                updatedSections.unshift({
                  title: "나의 칵테일 바",
                  data: [formattedBar],
                });
              }
              return updatedSections;
            });

            //리프레시 트리거 (의미상 갱신)
            setRefreshTrigger((prev) => prev + 1);
          } else {
            showToast("리스트 추가 실패");
          }
        } catch (error) {
          console.error("가게 추가 에러:", error);
          showToast("네트워크 오류");
        }
      }}

      />
      ): selectedTab ==="myBardetailList" ? (
        <MyBardetailListBottomSheet listId={selectedBarId} />
      ) : selectedTab === "myList" ? (
        <>
          <MyListSheetContent 
              handleTabPress={(tab, bar) => {
                if (tab === "myBardetailList") {
                  setSelectedBarId(bar.id); // 리스트 ID 설정
                }
                handleTabPress(tab, bar);
              }}
              bookmarkedBars={myBars} //실제 데이터 전달
              />
          <MyBardetailListBottomSheet/>
        </>
          
      ) : selectedTab ==="regionDetail" ? (
        <SelectedRegions
        selectedRegions={selectedRegions}
        onRegionSelect={(region) => {
          console.log("선택된 지역:", region);
        }}
        handleTabPress={handleTabPress}
        bookmarkIds={bookmarkIds}
        setBookmarkIds={setBookmarkIds}
        bookmarkListMap={bookmarkListMap}
        setBookmarkListMap={setBookmarkListMap}
        handleBookmarkToggle={handleBookmarkToggle}
      />
      ): selectedTab === "myList" ? (
          <MyListSheetContent handleTabPress={handleTabPress} />
      ) : selectedTab === "detail" ? (
          <MenuListDetail 
            handleTabPress={handleTabPress}
            barId={selectedBarId}
            bookmarkIds={bookmarkIds}
            setBookmarkIds={setBookmarkIds}
            bookmarkListMap={bookmarkListMap}
            setBookmarkListMap={setBookmarkListMap}
            myBars={myBars}
            setMyBars={setMyBars}
            setSections={setSections}
            setRefreshTrigger={setRefreshTrigger}
            defaultListId={myList?.[0]?.id}
            refreshTrigger={refreshTrigger}
            centerMapOnBar={centerMapOnBar}
            />
      ) : (
      <SearchSheetContent
      key={`search-${refreshTrigger}`}
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

    <Portal>
     <LoginBottomSheet
      isVisible={isLoginSheetVisible}
      onClose={() => setLoginSheetVisible(false)}
      onLogin={() => {
        setLoginSheetVisible(false);
        navigation.navigate("Login");
      }}
      navigation={navigation}
    />
    </Portal>
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
  dimmedBackground: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 99,
  },
});

export default BaseBottomSheet;