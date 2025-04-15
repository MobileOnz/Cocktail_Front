import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import { API_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MenuListDetail = ({
  handleTabPress,
  barId,
  bookmarkIds,
  setBookmarkIds,
}) => {
  const [barDetail, setBarDetail] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (!barId) return;

    const fetchBarDetail = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE_URL}/api/bar/${barId}`, {
          headers: token ? { Authorization: `${token}` } : {},
        });
        const result = await res.json();
        if (result && result.id) {
          setBarDetail(result);
          setSelectedCategory(result.menus?.[0]?.category ?? null);
        }
      } catch (err) {
        console.error("Bar detail fetch error:", err);
      }
    };

    fetchBarDetail();
  }, [barId]);

  if (!barDetail) {
    return (
      <View style={{ padding: 20 }}>
        <Text>불러오는 중...</Text>
      </View>
    );
  }

  const isBookmarked = bookmarkIds.has(barDetail.id);
  const filteredMenus = barDetail.menus.filter(
    (menu) => menu.category === selectedCategory
  );

  const handleBookmarkToggle = async () => {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      Alert.alert("로그인이 필요합니다.");
      return;
    }

    if (isBookmarked) {
      // 북마크 해제
      const newSet = new Set(bookmarkIds);
      newSet.delete(barDetail.id);
      setBookmarkIds(newSet);
    } else {
      // 북마크 추가 → 리스트 선택 시트로 이동
      handleTabPress("bookmark", barDetail);
    }
  };

  return (
    <BottomSheetScrollView style={styles.container}>
      <TouchableOpacity onPress={() => handleTabPress("search")} style={styles.backButton}>
        <Text style={styles.backText}>← 목록으로</Text>
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <Text style={styles.barName}>{barDetail.bar_name}</Text>
        <TouchableOpacity onPress={handleBookmarkToggle}>
          <Image
            source={
              isBookmarked
                ? require("../assets/drawable/bookmark_box_checked.png")
                : require("../assets/drawable/bookmark_box.png")
            }
            style={styles.bookmarkIcon}
          />
        </TouchableOpacity>
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

        <View style={styles.infoItem}>
          <Image source={require("../assets/drawable/bookmark.png")} style={styles.icon} />
          <Text style={styles.infoText}>{barDetail.url}</Text>
        </View>

        <View style={styles.infoItem}>
          <Image source={require("../assets/drawable/bookmark.png")} style={styles.icon} />
          <Text style={styles.infoText}>결제 정보</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={[styles.menuTitle, { paddingLeft: widthPercentage(16) }]}>메뉴</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tabsContainer}>
          {barDetail.menus.map((menu, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tab, selectedCategory === menu.category && styles.tabActive]}
              onPress={() => setSelectedCategory(menu.category)}
            >
              <Text style={styles.tabText}>{menu.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {filteredMenus.map((menu, index) => (
        <View key={index} style={styles.menuItem}>
          <Image source={{ uri: menu.image_url }} style={styles.menuImage} />
          <View style={styles.menuInfo}>
            <Text style={styles.menuName}>{menu.name}</Text>
            <Text style={styles.menuPrice}>{menu.sell_price}원</Text>
          </View>
        </View>
      ))}
    </BottomSheetScrollView>
  );
};

export default MenuListDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFCF3",
  },
  backButton: {
    padding: heightPercentage(16),
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: fontPercentage(16),
    color: "#007AFF",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: widthPercentage(16),
  },
  barName: {
    fontSize: fontPercentage(20),
    fontWeight: "bold",
    color: "#3E3E3E",
    marginBottom: heightPercentage(20),
  },
  bookmarkIcon: {
    width: widthPercentage(76),
    height: heightPercentage(36),
    marginBottom: heightPercentage(20),
  },
  scrollContainer: {
    paddingHorizontal: widthPercentage(12),
    paddingBottom: heightPercentage(10),
  },
  imgSize: {
    width: widthPercentage(178),
    height: heightPercentage(200),
    borderRadius: widthPercentage(10),
    resizeMode: "cover",
  },
  infoContainer: {
    paddingHorizontal: widthPercentage(16),
    paddingTop: heightPercentage(10),
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: heightPercentage(6),
  },
  icon: {
    width: widthPercentage(20),
    height: heightPercentage(20),
    marginRight: widthPercentage(8),
  },
  infoText: {
    fontSize: fontPercentage(14),
    color: "#3E3E3E",
  },
  divider: {
    height: heightPercentage(8),
    backgroundColor: "#F2F0EC",
    marginVertical: heightPercentage(16),
  },
  menuTitle: {
    fontWeight: "700",
    fontSize: fontPercentage(18),
    paddingTop: heightPercentage(16),
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: widthPercentage(14),
    paddingTop: heightPercentage(10),
  },
  tab: {
    paddingHorizontal: widthPercentage(12),
    paddingVertical: heightPercentage(6),
  },
  tabText: {
    fontSize: fontPercentage(14),
    color: "#B9B6AD",
  },
  tabActive: {
    borderBottomWidth: heightPercentage(2),
    borderColor: "#3E3E3E",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: widthPercentage(16),
    marginVertical: heightPercentage(12),
  },
  menuImage: {
    width: widthPercentage(80),
    height: heightPercentage(80),
    borderRadius: widthPercentage(8),
    marginRight: widthPercentage(12),
  },
  menuInfo: {},
  menuName: {
    fontSize: fontPercentage(16),
    fontWeight: "600",
  },
  menuPrice: {
    fontSize: fontPercentage(14),
    color: "#7D7A6F",
    marginTop: heightPercentage(4),
  },
});
