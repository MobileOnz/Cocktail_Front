// CustomMapView.tsx
import React, { useState } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { StyleSheet, Image, View, Text } from "react-native";

const imageMap = {
  1: require("../assets/newListIcon/Name=Classic_Status=Default.png"),
  2: require("../assets/newListIcon/Name=Light_Status=Default.png"),
  3: require("../assets/newListIcon/Name=Party_Status=Default.png"),
  4: require("../assets/newListIcon/Name=Play_Status=Default.png"),
  5: require("../assets/newListIcon/Name=Shine_Status=Default.png"),
  6: require("../assets/newListIcon/Name=Summer_Status=Default.png"),
  7: require("../assets/newListIcon/Name=Primary_Status=Default.png")
};


 
const CustomMapView = ({ region, mapRef, markerList, onMarkerPress,onDrag, selectedBarId}) => {
  const [iconLoadedMap, setIconLoadedMap] = useState({});

  const handleImageLoad = (id) => {
    setIconLoadedMap((prev) => ({ ...prev, [id]: true }));
  };
  const customMapStyle = [
    {
      featureType: "poi", // 모든 POI (장소 정보) 숨김
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit", // 지하철, 버스 등의 교통 정보 숨김
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
  ];

  
return (
    <MapView
      key={`${selectedBarId}-${markerList.map(m => `${m.id}-${m.icon_tag}`).join(",")}`}
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={region}
      onPanDrag={() => {
        onDrag?.(); // 부모에게 알림
      }}
      customMapStyle={customMapStyle}
    >
      {markerList?.map((marker) => {
        const lat = Number(marker.coordinate.latitude);
        const lng = Number(marker.coordinate.longitude);
        if (isNaN(lat) || isNaN(lng)) return null;

        const iconSource = imageMap[marker.icon_tag] ?? imageMap[7];
        const isLoaded = iconLoadedMap[marker.id] ?? false;
        const isSelected = marker.id === selectedBarId; // ✅ 선택 여부 확인

        return (
          <Marker
            tracksViewChanges={!isLoaded}
            key={marker.id}
            coordinate={{ latitude: lat, longitude: lng }}
            onPress={() => onMarkerPress?.(marker.id)}
            anchor={{ x: 0.1, y: 0.5 }}
          >
            <View style={styles.markerWrapper}>
              <Image
                source={iconSource}
                style={styles.markerIcon}
                onLoad={() => handleImageLoad(marker.id)}
              />
              <View
                style={[
                  styles.labelContainer,
                  isSelected && styles.labelContainerSelected, // ✅ 배경색 다르게
                ]}
              >
                <Text
                  style={[
                    styles.labelText,
                    isSelected && styles.labelTextSelected, // ✅ 텍스트색 다르게
                  ]}
                >
                  {marker.title}
                </Text>
              </View>
            </View>
          </Marker>
        );
      })}

    </MapView>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1 },
  markerIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  labelContainer: {
    marginTop: 4,
    backgroundColor: "#2d2d2d", // 진한 보라
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  labelText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  markerWrapper: {
    alignItems: "center",
  },
  labelContainerSelected: {
    backgroundColor: "#fffcf3", // 선택된 배경색
  },
  labelTextSelected: {
    color: "#000000", // 선택된 텍스트색
  },  
});

export default CustomMapView;