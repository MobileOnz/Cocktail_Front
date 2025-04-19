// CustomMapView.tsx
import React from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { StyleSheet, Image, View, Text } from "react-native";


// 마커 이미지 import
const classicIcon = require("../assets/newListIcon/Name=Primary_Status=Default.png");


const CustomMapView = ({ initialRegion, mapRef, markerList, onMarkerPress }) => {
  return (
    <MapView
      key={markerList.length} //markerList가 바뀔 때마다 MapView를 강제 리렌더링
      ref={mapRef}
    
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      region={initialRegion}
    >
      {markerList?.map((marker) => {
      console.log("📍 마커 찍음", marker);
      const lat = Number(marker.coordinate.latitude);
      const lng = Number(marker.coordinate.longitude);

      if (isNaN(lat) || isNaN(lng)) return null; // 🔒 좌표 유효성 검사


      return (
        <Marker
          key={marker.id}
          coordinate={{ latitude: lat, longitude: lng }}
          title={marker.title}
          onPress={() => onMarkerPress?.(marker.id)}
        >
          <View style={styles.markerWrapper}>
            <Image source={classicIcon} style={styles.markerIcon} />
            <View style={styles.labelContainer}>
              <Text style={styles.labelText}>{marker.title}</Text>
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
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  labelContainer: {
    marginTop: 4,
    backgroundColor: "#1C1238", // 진한 보라
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
});

export default CustomMapView;