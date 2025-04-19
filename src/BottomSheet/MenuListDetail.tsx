import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import { API_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "../Components/ToastContext";

import Clipboard from '@react-native-clipboard/clipboard';
import { formatBarForMyList } from "../utils/formatBar";

const MenuListDetail = ({
  handleTabPress,
  barId,
  bookmarkIds,
  setBookmarkIds,
  bookmarkListMap,
  setBookmarkListMap,
  myBars,
  setMyBars,
  setSections,
  setRefreshTrigger,
  defaultListId,
  refreshTrigger,
  centerMapOnBar,
}) => {
  const [barDetail, setBarDetail] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const {showToast} = useToast();

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    console.log("복사됨 : ", text);
    showToast("주소가 클립보드에 복사되었습니다.");
  };

  //영업시간을 설정하기 위한 변수
  const [showHours, setShowHours] = useState(false);

  //시간 비교를 위한 유틸 함수 추가
  const getOpenStatus = (hours: any[]) => {
    if (!Array.isArray(hours)) return "";
  
    const now = new Date();
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const currentDayIndex = now.getDay();
    const currentDay = days[currentDayIndex];
    const currentTime = now.getHours() * 60 + now.getMinutes();
  
    const today = hours.find((h) => h.day_of_week === currentDay);
    if (!today) return "운영시간 정보 없음";
    if (today.is_closed) return "오늘은 휴무입니다";
  
    const [openH, openM] = today.opening_hour.split(":").map(Number);
    const [closeH, closeM] = today.closing_hour.split(":").map(Number);
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;
  
    // 닫는 시간이 더 빠르면 익일 마감 (ex. 18:30 ~ 01:30)
    const isOvernight = closeTime <= openTime;
  
    if (isOvernight) {
      if (currentTime >= openTime || currentTime < closeTime) {
        return `영업중 · ${today.closing_hour}에 영업 종료`;
      } else if (currentTime < openTime) {
        return `영업 전 · ${today.opening_hour}에 오픈`;
      } else {
        return `영업 종료 · 내일 확인해주세요`;
      }
    } else {
      if (openTime <= currentTime && currentTime < closeTime) {
        return `영업중 · ${today.closing_hour}에 영업 종료`;
      } else if (currentTime < openTime) {
        return `영업 전 · ${today.opening_hour}에 오픈`;
      } else {
        return `영업 종료 · 내일 확인해주세요`;
      }
    }
  };
  
  
  const getKoreanDay = (eng: string) => {
    const dict: any = {
      MON: "월요일",
      TUE: "화요일",
      WED: "수요일",
      THU: "목요일",
      FRI: "금요일",
      SAT: "토요일",
      SUN: "일요일",
    };
    return dict[eng] || eng;
  };

  
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
          console.log("📍 barDetail 응답값:", result); // 👉 좌표 포함 여부 확인
          setBarDetail(result);
          setSelectedCategory(result.menus?.[0]?.category ?? null);

          const x = Number(result.x);
          const y = Number(result.y);

          if(!isNaN(x) && !isNaN(y)){
            centerMapOnBar?.(x,y);
          }
        }
      } catch (err) {
        console.error("Bar detail fetch error:", err);
      }
    };

    fetchBarDetail();
  }, [barId, refreshTrigger]);

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
  
    if (!barDetail) return;
  
    const barId = barDetail.id;
  
    if (bookmarkIds.has(barId)) {
      // 북마크 해제 로직 그대로 유지
      const listId = bookmarkListMap.get(barId);
      if (!listId) {
        Alert.alert("에러", "해당 가게의 리스트 정보가 없습니다.");
        return;
      }
  
      try {
        const response = await fetch(`${API_BASE_URL}/api/item`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ listId, barId }),
        });
  
        const result = await response.json();
        if (result.code === 1) {
          const newSet = new Set(bookmarkIds);
          newSet.delete(barId);
          setBookmarkIds(newSet);
  
          const newMap = new Map(bookmarkListMap);
          newMap.delete(barId);
          setBookmarkListMap(newMap);
  
          setMyBars((prev) => prev.filter((bar) => bar.id !== barId));
          
          setSections((prevSections) =>
            prevSections.map((section) =>
              section.title === "나의 칵테일 바"
                ? { ...section, data: section.data.filter((bar) => bar.id !== barId) }
                : section
            )
          );
  
          setRefreshTrigger?.((prev) => prev + 1);
          Alert.alert("북마크 해제", "리스트에서 삭제되었습니다.");
        } else {
          Alert.alert("실패", result.msg || "서버에서 북마크 해제 실패");
        }
      } catch (err) {
        console.error("북마크 해제 요청 실패:", err);
        Alert.alert("에러", "네트워크 오류 발생");
      }
    } else {
      // 북마크 추가는 SelectionListSheet에서 처리하도록 → 리스트 선택화면으로 이동
      handleTabPress("bookmark", barDetail);

      const formattedBar = formatBarForMyList(barDetail);
      handleTabPress("bookmark", { raw: barDetail, formatted: formattedBar});
    }
  };
  
  
  
  

  return (
    <BottomSheetScrollView style={styles.container}>
      <TouchableOpacity onPress={() => handleTabPress("search")} style={styles.backButton}>
        <Image
          source={require("../assets/drawable/cancel.png")}
          style={styles.cancelIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View style={styles.headerRow}>
      <View style={styles.nameContainer}>
        <Text style={styles.barName}>{barDetail.bar_name}</Text>
      </View>
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
      {barDetail.photos
        .filter((url) => !!url && url !== "")
        .slice(0, 2)
        .map((photoUrl, index) => (
          <Image
            key={index}
            source={{ uri: photoUrl }}
            style={[styles.imgSize, index === 0 && { marginRight: widthPercentage(12) }]}
          />
      ))}
      </ScrollView>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Image source={require("../assets/drawable/location.png")} style={styles.icon} />
          <Text style={styles.infoText}>{barDetail.address}</Text>
          <TouchableOpacity onPress={() => copyToClipboard(barDetail.address)}>
            <Image source={require("../assets/drawable/copy_box.png")} style={styles.copyButton}/>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => Linking.openURL(`tel:${barDetail.phone}`)}>
          <View style={styles.infoItem}>
            <Image source={require("../assets/listdetail/phone.png")} style={styles.icon} />
            <Text style={styles.infoText}>{barDetail.phone}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowHours((prev) => !prev)}>
          <View style={styles.infoItem}>
            <Image source={require("../assets/drawable/time.png")} style={styles.icon} />
            <Text style={[styles.infoText, {fontWeight: "bold"}]}>
              {getOpenStatus(barDetail.open_hours)}
            </Text>
            <Image
                source={
                  showHours
                    ? require("../assets/drawable/up.png")
                    : require("../assets/drawable/down.png")
                }
                style={styles.arrowIcon}
              />
          </View>
        </TouchableOpacity>

        {showHours &&
          barDetail.open_hours.map((hour, index) => (
            <Text key={index} style={[styles.infoText, {marginLeft: widthPercentage(30)}, {padding: widthPercentage(2)}]}>
              {getKoreanDay(hour.day_of_week)} {hour.is_closed ? "휴무" : `${hour.opening_hour} ~ ${hour.closing_hour}`}
            </Text>
          ))}

        <TouchableOpacity onPress={() => Linking.openURL(barDetail.url)}>
          <View style={styles.infoItem}>
            <Image source={require("../assets/drawable/sns.png")} style={styles.icon} />
            <Text style={styles.infoText}>{barDetail.url}</Text>
          </View>
        </TouchableOpacity>
        

        <View style={styles.infoItem}>
          <Image source={require("../assets/drawable/payment.png")} style={styles.icon} />
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
          {menu.image_url ? (
            <Image source={{ uri: menu.image_url }} style={styles.menuImage} />
          ) : (
            <View style={[styles.menuImage, { backgroundColor: "#DDD" }]} />
          )}
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
    alignSelf: "flex-end",
    padding: widthPercentage(20),
  },
  cancelIcon: {
    width: widthPercentage(18),
    height: widthPercentage(18),
  },
  backText: {
    fontSize: fontPercentage(16),
    color: "#007AFF",
  },
  copyButton: {
    width: widthPercentage(47),
    height: heightPercentage(28),
    paddingLeft: widthPercentage(5),
    borderRadius: widthPercentage(8),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: widthPercentage(16),
  },
  arrowIcon: {
    width: widthPercentage(16),
    height: widthPercentage(16),
    marginLeft: widthPercentage(6),
  },
  nameContainer: {
    flex: 1, //북마크 제외 전체 너비 사용
    paddingRight: widthPercentage(8), //북마크랑 거리두기
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
    marginTop: heightPercentage(4),
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
