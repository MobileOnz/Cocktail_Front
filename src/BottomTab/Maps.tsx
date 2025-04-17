import React, { useState, useEffect,useRef } from "react";
import { StackScreenProps } from "@react-navigation/stack";
import { View, StyleSheet, StatusBar, Text, TouchableOpacity, TextInput,Image } from "react-native";
import SearchBar from "../Components/SearchBar";
import CustomMapView from "../Components/CustomMapView";
import BaseBottomSheet from "../BottomSheet/BaseBottomSheet";
import theme from "../assets/styles/theme";
import { heightPercentage, widthPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import SelectedRegionTags from "../Components/SelectedRegionTags";
import Animated, {
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { useSharedValue } from "react-native-reanimated";
import axios from "axios";
import {API_BASE_URL} from "@env"
import MapView from "react-native-maps";

type RootStackParamList = {
  SearchScreen: undefined;
  Maps: { searchCompleted?: boolean; selectedRegions? : string[], searchQuery : string,
     resetRequested? : boolean };
};

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
  const [barData, setBarData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("search")
  const [isSearchCompleted, setIsSearchCompleted] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [activeRegion, setActiveRegion] = useState<string|null>(null);
  const [markerList, setMarkerList] = useState([]);
  const {searchQuery} = route.params|| "";
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
          }));
  
          setBarData(formatted);       // UI용 바텀시트
          setMarkerList(markers);      // 지도 마커용
          setSelectedTab("search");    // 바텀시트 탭도 맞춰주면 좋음
  
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
        } else {
          console.log("서버 요청 에러:", response.data.msg);
        }
      } catch (error) {
        console.log("서버 호출 실패:", error);
      }
    };
  
    fetchNearbyBars();
  }, []);
  

  useEffect(() => {
    console.log("✅ Maps에서 보내는 markerList:", markerList);
  }, [markerList]);
  useEffect(() => {
    if (selectedRegions.length > 0 && !activeRegion) {
      setActiveRegion(selectedRegions[0]); 
    }
  }, [selectedRegions]);


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
          setSelectedRegions([]);
        }}
      />
    </View>
  )}

</View>
<BaseBottomSheet
  animatedPosition={animatedPosition}
  selectedRegions={selectedRegions}
  barData={barData}
  setBarData={setBarData}
  
/>
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
