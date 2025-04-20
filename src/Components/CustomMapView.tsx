// CustomMapView.tsx
import React, { useState } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { StyleSheet, Image, View, Text } from "react-native";


// 마커 이미지 import
const classicIcon = require("../assets/newListIcon/Name=Classic_Status=Default.png");


const CustomMapView = ({ initialRegion, mapRef, markerList }) => {
  const [iconLoaded, setIconLoaded] = useState(false);

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

      if (isNaN(lat) || isNaN(lng)) return null; 


      return (
        <Marker
        key={marker.id}
        coordinate={{ latitude: lat, longitude: lng }}
        tracksViewChanges={!iconLoaded}
      >
        <View style={{ alignItems: "center" }}>
          <Image
            source={classicIcon}
            style={styles.markerIcon}
            onLoadEnd={() => setIconLoaded(true)}
          />
          <Text style={{ fontSize: 12, color: "#000", marginTop: 4 }}>
            {marker.title}
          </Text>
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
    width: 15,
    height: 15,
    resizeMode: "contain",
  },
});

export default CustomMapView;