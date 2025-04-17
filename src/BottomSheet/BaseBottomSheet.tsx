import React, { useMemo, useState,useRef,useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
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
import SelectedRegions from "./SelectedRegions";
import MapView from "react-native-maps";

const BaseBottomSheet = ({ animatedPosition, selectedRegions, barData, setBarData  }) => {
  const mapRef = useRef<MapView>(null);

  const navigation = useNavigation();
  const snapPoints = useMemo(() => ["10%", "30%", "76%"], []);
  const [selectedTab, setSelectedTab] = useState<"search" | "myList" | "region"|"regionDetail" | "bookmark"| "detail"|"myBardetailList">("search");
  const [selectedBar, setSelectedBar] = useState(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isLoginSheetVisible, setLoginSheetVisible] = useState(false);
  const [sheetReady, setSheetReady] = useState(false);
  const [markerList, setMarkerList] = useState([]);

// 🔹 지역 선택 시 주변 바 조회
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
    if (selectedTab === "detail") {
      bottomSheetRef.current?.expand();
    }
  }, [selectedTab]);

  // sections 데이터 변경
  const sections = useMemo(() => {
    return [
      // { title: "나의 칵테일 바", data: myBars },
      { title: "근처 칵테일 바", data: barData }
    ];
  }, [selectedTab, barData]);

  // 탭 변경 핸들러
  const handleTabPress = (tab: "search" | "myList" | "region"|"regionDetail" | "bookmark" | "detail"|"pin"|"myBardetailList", bar = null) => {
    if (tab === "bookmark" || tab ==="detail") {
      setSelectedBar(bar);
    }
    setSelectedTab(prev => (prev === tab ? "search" : tab));
  };

  return (
    <>
<BottomSheet
  ref={bottomSheetRef}
  index={0}
  snapPoints={snapPoints}
  animatedPosition={animatedPosition}
  onLayout={() => {
    setSheetReady(true);
  }}
  enablePanDownToClose={false}
  backgroundStyle={{ backgroundColor: theme.background }}
  containerStyle={{ position: 'absolute', zIndex: 100 }}
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
      onSave={(selectedItem) => console.log("선택한 아이템:", selectedItem)}
      />
      ): selectedTab ==="myBardetailList" ? (
        <MyBardetailListBottomSheet/>
      ) : selectedTab ==="regionDetail" ? (
        <SelectedRegions
        selectedRegions={selectedRegions}
        onRegionSelect={(region) => {
          console.log("선택된 지역:", region);
        }}
      />
      ): selectedTab === "myList" ? (
          <MyListSheetContent handleTabPress={handleTabPress} />
      ) : selectedTab === "detail" ? (
      <MenuListDetail handleTabPress={handleTabPress} selectedBar={selectedBar}/>
      ) : (
      <SearchSheetContent
      sections={sections}
      showMyBars={true}
      handleTabPress={handleTabPress}
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