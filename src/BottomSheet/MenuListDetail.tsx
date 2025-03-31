import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import { API_BASE_URL } from "@env";

const MenuListDetail = ({ handleTabPress, barId }) => {
  const [barDetail, setBarDetail] = useState(null);

  useEffect(() => {
    console.log("🔥 barId:", barId);
    if (!barId) return;

    fetch(`${API_BASE_URL}/api/bar/${barId}`)
      .then(res => res.json())
      .then(result => {
        if (result && result.id) {
          setBarDetail(result);
        }
      })
      .catch(err => console.error("Bar detail fetch error:", err));
  }, [barId]);

  if (!barDetail) {
    return (
      <View style={{ padding: 20 }}>
        <Text>불러오는 중...</Text>
      </View>
    );
  }

  return (
    <BottomSheetScrollView style={styles.container}>
      <TouchableOpacity onPress={() => handleTabPress("search")} style={styles.backButton}>
        <Text style={styles.backText}>← 목록으로</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.barName}>{barDetail.bar_name}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {barDetail.photos.slice(0, 2).map((photoUrl, index) => (
          <Image
            key={index}
            source={{ uri: photoUrl }}
            style={[styles.imgSize, index === 0 && { marginRight: widthPercentage(12) }]}
          />
        ))}
      </ScrollView>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Image source={require("../assets/listdetail/location.png")} style={styles.icon} />
          <Text style={styles.infoText}>{barDetail.address}</Text>
        </View>

        <View style={styles.infoItem}>
          <Image source={require("../assets/listdetail/phone.png")} style={styles.icon} />
          <Text style={styles.infoText}>{barDetail.phone}</Text>
        </View>
      </View>

      <Text style={[styles.menuTitle, { paddingLeft: widthPercentage(16) }]}>메뉴</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tabsContainer}>
          {barDetail.menus.map((menu, index) => (
            <TouchableOpacity key={index} style={styles.tab}>
              <Text style={styles.tabText}>{menu.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </BottomSheetScrollView>
  );
};

export default MenuListDetail;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFCF3" },
  backButton: { padding: 16, alignSelf: "flex-start" },
  backText: { fontSize: 16, color: "#007AFF" },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  barName: { fontSize: fontPercentage(20), fontWeight: "bold", color: "#3E3E3E" },
  scrollContainer: { paddingHorizontal: 12, paddingBottom: 10 },
  imgSize: { width: 178, height: 200, borderRadius: 10, resizeMode: "cover" },
  infoContainer: { paddingHorizontal: 16, paddingTop: 10 },
  infoItem: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  icon: { width: 20, height: 20, marginRight: 8 },
  infoText: { fontSize: 14, color: "#3E3E3E" },
  menuTitle: { fontWeight: "700", fontSize: 18, paddingTop: 24 },
  tabsContainer: { flexDirection: "row", paddingHorizontal: 14, paddingTop: 16, paddingBottom: 30 },
  tab: { alignItems: "center", paddingHorizontal: 12 },
  tabText: { fontSize: 14, color: "#B9B6AD", fontWeight: "500", paddingBottom: 6 },
});
