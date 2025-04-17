// CustomMapView.tsx
import React from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { StyleSheet, Image } from "react-native";


// 마커 이미지 import
const classicIcon = require("../assets/newListIcon/Name=Classic_Status=Default.png");


const CustomMapView = ({ initialRegion, mapRef, markerList }) => {
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
          description="검색된 바"
          
        >
          <Image source={classicIcon} style={styles.markerIcon} />
        </Marker>

      );
    })}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1 },
  markerIcon: {
    width: 36,
    height: 36,
    resizeMode: "contain",
  },
});

export default CustomMapView;