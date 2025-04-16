import React, { useState, useEffect, useRef } from "react";
import { StackScreenProps } from "@react-navigation/stack";
import { View, StyleSheet, StatusBar, Text, TouchableOpacity, TextInput,Image } from "react-native";
import SearchBar from "../Components/SearchBar";
import CustomMapView from "../Components/CustomMapView";
import BaseBottomSheet from "../BottomSheet/BaseBottomSheet";
import theme from "../assets/styles/theme";
import { heightPercentage, widthPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import SelectedRegions from "../BottomSheet/SelectedRegions";
import SelectedRegionTags from "../Components/SelectedRegionTags";
import MapView from "react-native-maps";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

import Animated, {
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { useSharedValue } from "react-native-reanimated";

type RootStackParamList = {
  SearchScreen: undefined;
  Maps: { searchCompleted?: boolean; selectedRegions? : string[], searchQuery : string,
     resetRequested? : boolean };
};
import { Dimensions } from "react-native";

type MapsProps = StackScreenProps<RootStackParamList, "Maps">;

const buttonStartY = heightPercentage(980); // 예: 바텀시트가 "10%"일 때 버튼은 아래쪽
const buttonEndY = heightPercentage(100);
const CurrentLocationButton = ({ animatedPosition, onPress }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      animatedPosition.value,
      [0,800],
      [buttonEndY, buttonStartY],
      "clamp"
    );
    return {
      transform: [{ translateY }],
      position: "absolute",
      right: 20,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity style={styles.currentLocationButton} onPress={onPress}>
        <Image
          source={require("../assets/drawable/currentlocation.png")}
          style={styles.locationIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const Maps: React.FC<MapsProps> = ({ navigation, route }) => {
  const mapRef = useRef<MapView>(null);

  const animatedPosition = useSharedValue(0);
  
  const [isSearchCompleted, setIsSearchCompleted] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const {searchQuery} = route.params|| "";
  
  

  const [barList, setBarList] = useState([]);
  const [selectedTab, setSelectedTab] = useState("search");

  const [markerList, setMarkerList] = useState([]);

  // ✅ MapsScreen에서 props로 받은 searchQuery 기반으로 API 요청
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
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
          }, 600);
        } catch (err) {
          console.error("검색 실패:", err);
        }
      };
  
      fetchData();
    }
  }, [route.params?.searchCompleted]);
  
  
  

  useEffect(() => {
    if (route.params?.searchCompleted) {
      setIsSearchCompleted(true);
    }
    if (route.params?.selectedRegions) {
      setSelectedRegions(route.params.selectedRegions);
    }
    if (route.params?.resetRequested){
      navigation.setParams({ resetRequested: false });
    }
  }, [route.params?.searchCompleted, route.params?.selectedRegions, route.params?.resetRequested]);

  const handleRemoveRegion = (region: string) => {
    setSelectedRegions((prevRegions) => prevRegions.filter((r) => r !== region));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {isSearchCompleted && (
        <View style={styles.resultHeader}>
          {/* 뒤로가기 버튼 */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>🔙</Text>
          </TouchableOpacity>

          {/* 검색 결과 화면 */}
          <TextInput
            style={[styles.searchButton, { backgroundColor: "white" }]}
            placeholder={searchQuery}
            placeholderTextColor="black"
            returnKeyType="done"
            onSubmitEditing={() => {
              navigation.navigate("Maps", { searchCompleted: true });
            }}
          />

          {/* 검색 초기화 버튼 */}
          <TouchableOpacity style={styles.clearButton} onPress={() => navigation.navigate("SearchScreen")}>
            <Text style={styles.buttonText}>X</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 지도 */}
      <View style={styles.mapContainer}>
        <CustomMapView
          initialRegion={{
            latitude: 37.5665,
            longitude: 126.978,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          mapRef={mapRef}
          markerList={markerList}
        />
      </View>
      <CurrentLocationButton
    animatedPosition={animatedPosition}
    onPress={() => {
    
    console.log("현재 위치 버튼 클릭됨");
  }}
/>
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
          console.log("전체 초기화 실행됨"); // ✅ 로그 찍히는지 확인
          setSelectedRegions([]);
        }}
      />
    </View>
  )}

</View>
    {selectedRegions.length > 0 ? (
      <SelectedRegions selectedRegions={selectedRegions} />
    ) : (
      <BaseBottomSheet
        animatedPosition={animatedPosition}
        barList={barList}
        setBarList={setBarList}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  currentLocationButton: {
    position: "absolute",
    bottom:100, // BottomSheet 위로 띄우기 (필요에 따라 조정)
    right: 20,
    width:50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,  // iOS에서 최상단
  },
  locationIcon: {
    width: widthPercentage(48),
    height: heightPercentage(48),
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
  },
  searchButton: {
    width: widthPercentage(275),
    height: heightPercentage(48),
    borderRadius: widthPercentage(8),
    backgroundColor: theme.background,
    paddingHorizontal: widthPercentage(10),
    zIndex: 10,
    marginBottom: heightPercentage(12),
    borderWidth: widthPercentage(1),
    borderColor: "#E4DFD8",
  },
  backButton: {
    marginBottom: heightPercentage(10),
    width: widthPercentage(24),
    height: heightPercentage(24),
    marginLeft: widthPercentage(16),
    marginRight: widthPercentage(10),
  },
  clearButton: {
    padding: widthPercentage(10),
    borderRadius: widthPercentage(8),
  },
  buttonText: {
    marginLeft: widthPercentage(5),
    marginBottom: heightPercentage(10),
    width: widthPercentage(24),
    height: heightPercentage(24),
  },
});

export default Maps;
