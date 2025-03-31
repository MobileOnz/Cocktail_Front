// CustomMapView.tsx
import React from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet } from "react-native";

const CustomMapView = ({ initialRegion, mapRef, markerList }) => {
  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={initialRegion}
    >
      {markerList?.map((marker) => {
      console.log("📍 마커 찍음", marker);
      return (
        <Marker
          key={marker.id}
          coordinate={marker.coordinate}
          title={marker.title}
          description="검색된 바"
        />
      );
    })}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1 },
});

export default CustomMapView;
