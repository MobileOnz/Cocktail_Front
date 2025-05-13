
import React, { useState, useEffect, useRef } from "react";

import { StackScreenProps } from "@react-navigation/stack";
import { View, StyleSheet, StatusBar, Text, TouchableOpacity, TextInput,Image, Dimensions } from "react-native";
import SearchBar from "../Components/SearchBar";
import CustomMapView from "../Components/CustomMapView";
import BaseBottomSheet from "../BottomSheet/BaseBottomSheet";
import theme from "../assets/styles/theme";
import { heightPercentage, widthPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import SelectedRegionTags from "../Components/SelectedRegionTags";
import MapView, { Region } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { getCurrentLocation,requestLocationPermission } from "../utils/requestLocationPermission";
import Animated, {
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { useSharedValue } from "react-native-reanimated";

import axios from "axios";

const REGION_CODE_MAP = {
  "서울 전체": "SEOUL_ALL",
  "강남/신논현/양재": "GANGNAM",
  "청담/압구정/신사": "CHEONGDAM",
  "선릉/삼성": "SEONREUNG",
  "논현/반포/학동": "NONHYEON",
  "서초/교대/방배": "SEOCHO",
  "대치/도곡/한티": "DAECHI",
  "홍대/합정/신촌": "HONGDAE",
  "서울역/명동/회현": "SEOULSTATION",
  "잠실/석촌/천호": "JAMSIL",
  "신당/왕십리": "SINDANG",
  "뚝섬/성수/서울숲/건대입구": "SEONGSU",
  "종로/을지로/충정로": "JONGRO",
  "마곡/화곡/목동": "MAGOK",
  "영등포/여의도/노량진": "YEOUIDO",
  "미아/도봉/노원": "NOWON",
  "이태원/용산/삼각지": "ITAEWON",
  "서울대/사당/동작": "DONGJAK",
  "은평/상암": "EUNPYEONG",
  "신도림/구로": "GURO",
  "마포/공덕": "MAPO",
  "금천/가산": "GASAN",
  "수서/복정/장지": "SUSEO",
}

type RootStackParamList = {
  SearchScreen: undefined;
  Maps: { searchCompleted?: boolean; selectedRegions? : string[], searchQuery : string,
     resetRequested? : boolean };
};

type MapsProps = StackScreenProps<RootStackParamList, "Maps">; 
const CurrentLocationButton = ({ handleCurrentLocationPress, onreSearch,searchQuery,isUsingCurrentLocation,buttonsEnabled }) => {
  return (
    <View pointerEvents="box-none" style={styles.buttonRowContainer}>
      
      {buttonsEnabled && (
  <TouchableOpacity
    style={styles.researchButtonContainer}
    onPress={onreSearch}
  >
    <Image
      source={require("../assets/drawable/researchButton.png")}
      style={styles.researchButton}
      resizeMode="contain"
    />
  </TouchableOpacity>
)}
      

      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={handleCurrentLocationPress}
      >
        <Image
          source={
            buttonsEnabled&&isUsingCurrentLocation
              ? require("../assets/drawable/currentlocation_active.png") // 현재 위치 사용 중인 아이콘
              : require("../assets/drawable/currentlocation.png") // 비활성화 아이콘
          }
          style={styles.locationIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};


const Maps: React.FC<MapsProps> = ({ navigation, route }) => {

  

  
  const [buttonsEnabled, setButtonsEnabled] = useState(false)
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false)

  
  //드래그 확인 
  const handleMapDrag = () => {
    setButtonsEnabled(true); 
    if(isUsingCurrentLocation){
      setIsUsingCurrentLocation(false)
      
    }
    
  };

  const handleSearchInCurrentMapRegion = async () => {
   
    try {
      const camera = await mapRef.current?.getCamera();
      if (!camera) return;
  
      const { latitude, longitude } = camera.center;
      console.log("지도 중심 좌표:", latitude, longitude);
  
      fetchNearbyBars(longitude, latitude);
      setButtonsEnabled(false);
    } catch (e) {
      console.error("다시 검색 중 에러:", e);
    }
  };
  
  const handleCurrentLocationPress = async () => {
    const coords = await getCurrentLocation();
    if (coords) {
      console.log("현재 위치 좌표:", coords);

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 500);
      }
      setRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01, // 기본 zoom 설정
        longitudeDelta: 0.01,
      });

      
      
      setIsUsingCurrentLocation(true); 

      setTimeout(() => {
      fetchNearbyBars(coords.longitude, coords.latitude);
      }, 600);
    } else {
      console.log("위치 가져오기 실패 또는 권한 없음");
    }
  }
  const mapRef = useRef<MapView>(null);


  const fetchNearbyBars = async (x: number, y: number, shouldSetTab = false) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/location/nearby`, {
        params: { x, y },
      });
  
      const rawData = response.data.data || [];
  
      const formatted = rawData.map((bar) => ({
        id: bar.id,
        title: bar.bar_name,
        barAdress: bar.address,
        thumbNail: bar.thumbnail
          ? { uri: bar.thumbnail }
          : require("../assets/drawable/barExample.png"),
        hashtagList: bar.menus.map((m) => `#${m.name}`),
      }));
  
      const markers = rawData.map((bar) => ({
        id: bar.id,
        title: bar.bar_name,
        coordinate: {
          latitude: Number(bar.y),
          longitude: Number(bar.x),
        },
        icon_tag: 5,
      }));
  
      setBarList(formatted);
      setMarkerList(markers);
      if (shouldSetTab) setSelectedTab("search");
  
      setTimeout(() => {
        if (mapRef.current && markers.length > 0) {
          mapRef.current.fitToCoordinates(
            markers.map((m) => m.coordinate),
            {
              edgePadding: { top: 100, right: 100, bottom: 300, left: 100 },
              animated: true,
            }
          );
        }
      }, 600);
    } catch (error) {
      console.error("❌ 서버 호출 실패:", error);
    }
  };
  

  useEffect(() => {
    
    // 앱 첫 진입 시 서울 고정 좌표로 바 조회
    // 검색을 통해 진입한 경우는 fetchNearbyBars를 호출하지 않음
    if (!route.params?.searchCompleted) {
    fetchNearbyBars(126.9812675, 37.5718599)
    }
  }, []);
  const animatedPosition = useSharedValue(0)

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("📐 animatedPosition:", animatedPosition.value);
    }, 500);
  
    return () => clearInterval(interval);
  }, []);

  
  const screenHeight = Dimensions.get("window").height;
  const bottomSheetThreshold = screenHeight * 0.25;

  const buttonWrapperStyle = useAnimatedStyle(() => {

    const isVisible = animatedPosition.value >= bottomSheetThreshold;

    return {
      position: "absolute",
      transform: [
        {
          translateY: interpolate(
            animatedPosition.value,
            [0, 800], // 바텀시트 움직이는 범위에 맞춰
            [-100, 750], // 버튼 위치 (픽셀로!)
            "clamp"
          ),
        },
      ],
      right: 20, // 그냥 고정값으로
      zIndex: 1000,
      opacity: isVisible ? 1:0,
      display: isVisible ? "flex" : "none",
    };
  });

  const [barData, setBarData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("search")
  const [isSearchCompleted, setIsSearchCompleted] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [activeRegion, setActiveRegion] = useState<string|null>(null);
  const [markerList, setMarkerList] = useState([]);
  const {searchQuery} = route.params|| "";

  
  const [region, setRegion] = useState({
    latitude: 37.5665, // 기본값: 서울
    longitude: 126.978,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  const [selectedBarId, setSelectedBarId] = useState<number | null>(null);
  const centerMapOnBar = (x: number, y: number) => {

    console.log("🗺️ centerMapOnBar 내부 실행됨. 좌표값:", x, y);
    console.log("📌 mapRef.current 존재 여부:", !!mapRef.current);

    if(mapRef.current && !isNaN(x) && !isNaN(y)){
      mapRef.current.animateToRegion(
        {
          latitude: y,
          longitude: x,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      )

    }else{
      console.log("❌ mapRef 또는 좌표값 문제 있음");
    }
  };


  

  const [barList, setBarList] = useState([]);
  

  //어떤 이벤트가 발생하든 ui를 리렌더링하기 위한 트리거
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // MapsScreen에서 props로 받은 searchQuery 기반으로 API 요청
  useEffect(() => {
    if (route.params?.searchCompleted && route.params.searchQuery) {
      const query = route.params.searchQuery;
  
      const fetchData = async () => {
        try {
          const token = await AsyncStorage.getItem('accessToken');
  
          const res = await fetch(
            `${API_BASE_URL}/api/search/keyword?search=${encodeURIComponent(query)}`,
            {
              method: "GET",
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `${token}` } : {}),
              },
            }
          );
  
          const result = await res.json();
          console.log("응답 결과:", result);
  
          if (!Array.isArray(result.data)) {
            throw new Error("검색 결과가 배열이 아닙니다.");
          }
  
          const formatted = result.data.map((bar) => ({
            id: bar.id,
            title: bar.bar_name,
            barAdress: bar.address || "주소 없음",
            thumbNail: bar.thumbnail 
              ? { uri: bar.thumbnail } 
              : require("../assets/drawable/barExample.png"),
            hashtagList: bar.menus.slice(0, 4).map(menu => `#${menu.name}`),
          }));
  
          //마커용 데이터 저장
          const markers = result.data.map((bar) => ({
            id: bar.id,
            title: bar.bar_name,
            coordinate: {
              latitude: Number(bar.y),
              longitude: Number(bar.x),
            },
          }));
  
          
          setBarList(formatted);
          setMarkerList(markers);
          setSelectedTab("search");
          //모든 마커가 보이도록 지도 이동
          setTimeout(() => {
            if (mapRef.current && markers.length > 0) {
              mapRef.current.fitToCoordinates(
                markers.map((m) => m.coordinate),
                {
                  edgePadding: { top: 100, right: 100, bottom: 300, left: 100 },
                  animated: true,
                }
              );
            }
          }, 1000);
        } catch (err) {
          console.error("검색 실패:", err);
        }
      };
  
      fetchData();
    }
  }, [route.params?.searchCompleted]);
  

  useEffect(() => {
    console.log("✅ Maps에서 보내는 markerList:", markerList);
  }, [markerList]);
  useEffect(() => {
    if (selectedRegions.length > 0 && !activeRegion) {
      setActiveRegion(selectedRegions[0]);
    }
  }, [selectedRegions]);
  
  useEffect(() => {
    console.log("✅ activeRegion 값 변경됨:", activeRegion);
  
    if (!activeRegion) return;
  
    const regionCode = REGION_CODE_MAP[activeRegion];
    if (!regionCode) return;
  
    const fetchRegionBars = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/location/filter`, {
          params: { areaCodes: regionCode },
        });
  
        const data = response.data?.data?.[regionCode] || [];
  
        const markers = data.map((bar) => ({
          id: bar.id,
          title: bar.bar_name,
          coordinate: {
            latitude: Number(bar.y),
            longitude: Number(bar.x),
          },
          icon_tag: 5,
        }));
  
        setBarList(data);
        setMarkerList(markers);
  
        if (mapRef.current && markers.length > 0) {
          mapRef.current.animateToRegion(
            {
              latitude: markers[0].coordinate.latitude,
              longitude: markers[0].coordinate.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            },
            500
          );
  
          setTimeout(() => {
            mapRef.current?.fitToCoordinates(
              markers.map((m) => m.coordinate),
              {
                edgePadding: { top: 100, right: 100, bottom: 300, left: 100 },
                animated: true,
              }
            );
          }, 600);
        }
      } catch (err) {
        console.error("❌ 지역 바 불러오기 실패:", err);
      }
    };
  
    fetchRegionBars();
  }, [activeRegion]);




  useEffect(() => {
    const { searchCompleted, selectedRegions, resetRequested, shouldRefresh } = route.params || {};
  
    if (searchCompleted) setIsSearchCompleted(true);
    if (selectedRegions) setSelectedRegions(selectedRegions);
    if (resetRequested) navigation.setParams({ resetRequested: false });
    if (shouldRefresh) {
      console.log("🔁 로그인 후 리프레시 감지됨");
      setRefreshTrigger(prev => prev + 1);
      navigation.setParams({ shouldRefresh: false });
    }
  }, [route.params]);

  const handleRemoveRegion = (region: string) => {
    setSelectedRegions((prevRegions) => prevRegions.filter((r) => r !== region));
  };

  return (
    
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
  
      {isSearchCompleted && (
        <>
        <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: heightPercentage(60), // 버튼 높이보다 약간 더 크게
          backgroundColor: theme.background,
          zIndex: 9999, // 버튼보다 높게
        }}/>
        <View style={styles.resultHeader}>
          {/* 뒤로가기 버튼 */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require("../assets/search/backspace.png")}
                          style={styles.buttonText}
                    />
          </TouchableOpacity>

          {/* 검색 결과 화면 */}
          <TextInput
            style={[styles.searchButton, {
              backgroundColor: "white",
              fontSize: fontPercentage(14),
              lineHeight: fontPercentage(14 * 1.429), 
              letterSpacing: fontPercentage(14 * 0.0145), 
              fontWeight: "700",
              paddingVertical: heightPercentage(12), 
              borderRadius: widthPercentage(8),
              borderWidth: widthPercentage(1),
              borderColor: "#E4DFD8",
              marginBottom: heightPercentage(12),
            },
            ]}
            placeholder={searchQuery}
            placeholderTextColor="black"
            returnKeyType="done"
            onSubmitEditing={() => {
              navigation.navigate("Maps", { searchCompleted: true });
            }}
          />


          {/* 검색 초기화 버튼 */}
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={() => navigation.pop(2)}
            
            >
            <Image source={require("../assets/search/mapsdelete.png")}
            style={[{width : widthPercentage(16),height: heightPercentage(16)}]}></Image>
          </TouchableOpacity>
        </View>
        </>
      )}

      {/* 지도 */}
      <View style={styles.mapContainer}>

        <CustomMapView
        region={region} // 지역 상태를 사용
          mapRef={mapRef}
          markerList={markerList}
          onMarkerPress={(barId) => {
            setSelectedTab("detail");
            setSelectedBarId(barId);
          }}
          onDrag={handleMapDrag}
          selectedBarId={selectedBarId}
        />
      </View>
  
      <View style={styles.searchContainer}>
  
{!isSearchCompleted &&(
  <SearchBar />
)}
  

    {/*지역 검색 시 태그 띄우기*/}
    {selectedRegions.length > 0 && (
    <View style={styles.tagsContainer}>
      <SelectedRegionTags 
        selectedRegions={selectedRegions} 
        onRemoveRegion={handleRemoveRegion} 
        onRemoveAllRegions={() => {
          setSelectedRegions([]);
          setActiveRegion(null);
          setSelectedTab("region")
        
          const restoreDefault = async () => {
            try {
              const response = await axios.get(`${API_BASE_URL}/api/location/nearby`, {
                params: { x: 126.9812675, y: 37.5718599 },
              });
        
              if (response.data.code === 1) {
                const data = response.data.data;
        
                const formatted = data.map((bar) => ({
                  id: bar.id,
                  title: bar.bar_name,
                  barAdress: bar.address,
                  thumbNail: bar.thumbnail
                    ? { uri: bar.thumbnail }
                    : require("../assets/drawable/barExample.png"),
                  hashtagList: bar.menus.map((m) => `#${m.name}`),
                }));
        
                const markers = data.map((bar) => ({
                  id: bar.id,
                  title: bar.bar_name,
                  coordinate: {
                    latitude: Number(bar.y),
                    longitude: Number(bar.x),
                  },
                  icon_tag: 5,
                }));
        
                setBarList(formatted);       // ✅ search 탭에서 필요한 데이터
                setMarkerList(markers);      // ✅ 지도에 찍을 마커
                setBarData(formatted);       // ✅ bottomsheet 내에서도 fallback
              }
            } catch (error) {
              console.error("기본 바 리스트 불러오기 실패:", error);
            }
          };
        
          restoreDefault();
        }}
        
        activeRegion={activeRegion} 
      />
    </View>
  )}

</View>
   
      <BaseBottomSheet
        key={`base-${refreshTrigger}`}
        selectedRegions={selectedRegions}
        onRegionSelect={setActiveRegion} 
        barData={barData}
        setBarData={setBarData}
        refreshTrigger={refreshTrigger}
        setRefreshTrigger={setRefreshTrigger}
        animatedPosition={animatedPosition}
        barList={barList}
        setBarList={setBarList}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        selectedBarId={selectedBarId}
        setSelectedBarId={setSelectedBarId}
        centerMapOnBar={centerMapOnBar}
        onBarMarkerPress={(barId: number) => {
          console.log("마커 클릭됨 -> barId:", barId);
          setSelectedTab("detail");
          setSelectedBarId(barId);
        }}
        markerList={markerList}
        setMarkerList={setMarkerList}
      />
      <Animated.View style={buttonWrapperStyle}>
        
  <CurrentLocationButton
    handleCurrentLocationPress={handleCurrentLocationPress}
    onreSearch={handleSearchInCurrentMapRegion}
    searchQuery={searchQuery}
    isUsingCurrentLocation={isUsingCurrentLocation}
    buttonsEnabled={buttonsEnabled} 
    
  />
</Animated.View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    zIndex: 100,
  },
  currentLocationButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  
  researchButtonContainer: {
    marginRight: 40, // 위치 버튼과 간격
    width: widthPercentage(147),
    height: heightPercentage(36),
    justifyContent: "center",
    alignItems: "center",
    zIndex : 1
  },
  researchButton : {
    width : widthPercentage(147),
    height : heightPercentage(36),
    resizeMode : "contain",
    zIndex : 1
  },
  locationIcon: {
    width: widthPercentage(54),
    height: heightPercentage(54),
  },
  searchContainer: {
    position: "absolute",
    flexDirection: "column",
    top: heightPercentage(50), 
    left: widthPercentage(16),
    right: widthPercentage(16),
    zIndex: 10, 
  },
  tagsContainer: {
    flexDirection: "row", // 태그를 가로 정렬
    marginTop: heightPercentage(55),
  },
  mapContainer: {
    flex: 1,
  },
  resultHeader: {
    marginTop: heightPercentage(58),
    backgroundColor: theme.background,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 50,
    zIndex: 9999,                 
    elevation: 9999,  
  },
  searchButton: {
    width: widthPercentage(275),
    height: heightPercentage(48),
    borderRadius: widthPercentage(8),
    backgroundColor: "white",
    paddingHorizontal: widthPercentage(10),
    zIndex: 10,
    marginBottom: heightPercentage(12),
    borderWidth: widthPercentage(1),
    borderColor: "#E4DFD8",
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    fontSize: fontPercentage(14),
    fontWeight: "700", // Pretendard Bold
    lineHeight: fontPercentage(14 * 1.429), // 142.9%
    letterSpacing: fontPercentage(14 * 0.0145), // 1.45%
    color: "#000000",
  },
  backButton: {
    marginBottom: heightPercentage(10),
    width: widthPercentage(24),
    height: heightPercentage(24),
    marginRight: widthPercentage(10),
  },
  clearButton: {
    padding: widthPercentage(10),
    borderRadius: widthPercentage(8),
    marginBottom : heightPercentage(8),
  },
  buttonText: {
    marginLeft: widthPercentage(5),
    marginBottom: heightPercentage(10),
    width: widthPercentage(24),
    height: heightPercentage(24),
  },
  textButton : {
    marginLeft: widthPercentage(5),
    marginBottom: heightPercentage(10),
    fontSize: fontPercentage(24)
  }
});

export default Maps;
