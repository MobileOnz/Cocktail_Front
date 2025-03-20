import React, { useRef } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Alert, StyleSheet } from "react-native";


const CustomMapView = ({ initialRegion}: { initialRegion: any;}) => {
  const mapRef = useRef<MapView>(null);

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={initialRegion}
    >
      <Marker
        coordinate={{ latitude: 37.5665, longitude: 126.9780 }}
        title="가게 이름"
        description="여기에 가게 설명 입력"
        onPress={() => {
          
        }}
      />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1 },
});

export default CustomMapView;
