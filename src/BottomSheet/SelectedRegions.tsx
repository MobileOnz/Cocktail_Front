import React, { useEffect, useRef, useState } from "react";
import {Text,View,TouchableOpacity,StyleSheet,Animated,Image,Alert,} from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import axios from "axios";
import { ScrollView } from "react-native-gesture-handler";
import { API_BASE_URL } from "@env";

import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";

const Tab = createMaterialTopTabNavigator()

// 지역 이름 → 서버 코드 매핑
const REGION_CODE_MAP = {
  "서울 전체": "SEOUL_ALL",
  "강남/신논현/양재": "GANGNAM",
  "청담/압구정/신사": "CHEONGDAM",
  "선릉/삼성": "SEONREUNG",
  "논현/반포/학동": "NONHYEON",
  "서초/교대/방배": "SEOCHO",
  "대치/도곡/한티": "DAECHI",
  "홍대/합정/신촌": "HONGDAE",
  "서울역/명동/회현": "SEOULSTATION",
  "잠실/석촌/천호": "JAMSIL",
  "신당/왕십리": "SINDANG",
  "뚝섬/성수/서울숲/건대입구": "SEONGSU",
  "종로/을지로/충정로": "JONGRO",
  "마곡/화곡/목동": "MAGOK",
  "영등포/여의도/노량진": "YEOUIDO",
  "미아/도봉/노원": "NOWON",
  "이태원/용산/삼각지": "ITAEWON",
  "서울대/사당/동작": "DONGJAK",
  "은평/상암": "EUNPYEONG",
  "신도림/구로": "GURO",
  "마포/공덕": "MAPO",
  "금천/가산": "GASAN",
  "수서/복정/장지": "SUSEO",
}

const SelectedRegions = ({
  selectedRegions = [],
  onRegionSelect,
  handleTabPress,
  bookmarkIds,
  setBookmarkIds,
  bookmarkListMap,
  setBookmarkListMap,
  handleBookmarkToggle,
}) => {
  const [barList, setBarList] = useState([]);
  const regionLayouts = useRef({});
  const scrollRef = useRef(null);
  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;
  const [activeRegion, setActiveRegion] = useState(null);

  const handleRegionPress = async (region) => {
    setActiveRegion(region);
    onRegionSelect?.(region);
    const layout = regionLayouts.current[region];
    if (layout) {
      Animated.timing(underlineX, {
        toValue: layout.x,
        duration: 200,
        useNativeDriver: false,
      }).start();
      Animated.timing(underlineWidth, {
        toValue: layout.width,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    const regionCode = REGION_CODE_MAP[region];
    if (!regionCode) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/location/filter`, {
        params: { areaCodes: regionCode },
      });
      const data = response.data?.data?.[regionCode] || [];
      setBarList(data);
    } catch (err) {
      console.error("바 데이터 요청 실패:", err);
      setBarList([]);
    }
  };

  useEffect(() => {
    if (selectedRegions.length === 0) return;
    const isActiveRegionStillValid = selectedRegions.includes(activeRegion);
    const firstRegion = selectedRegions[0];
    if (!activeRegion || !isActiveRegionStillValid) {
      const layout = regionLayouts.current[firstRegion];
      if (layout) {
        underlineX.setValue(layout.x);
        underlineWidth.setValue(layout.width);
      }
      setActiveRegion(firstRegion);
      onRegionSelect?.(firstRegion);
      handleRegionPress(firstRegion);
    }
  }, [selectedRegions]);

  const handleBookmarkPress = (bar) => {
    handleTabPress("bookmark", { raw: bar }); // 👉 MenuListDetail처럼 처리
  };

  return (
    <BottomSheetScrollView contentContainerStyle={{ paddingBottom: heightPercentage(40) }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {selectedRegions.map((region) => (
          <TouchableOpacity
            key={region}
            style={styles.tab}
            onPress={() => handleRegionPress(region)}
            onLayout={(e) => {
              regionLayouts.current[region] = {
                x: e.nativeEvent.layout.x,
                width: e.nativeEvent.layout.width,
              };
            }}
          >
            <Text
              style={region === activeRegion ? styles.activeText : styles.text}
            >
              {region}
            </Text>
          </TouchableOpacity>
        ))}
        <Animated.View
          style={[
            styles.underline,
            {
              transform: [{ translateX: underlineX }],
              width: underlineWidth,
            },
          ]}
        />
      </ScrollView>

      {/* 바 리스트 */}
      <View style={styles.listContainer}>
        {barList.map((item) => (
          <TouchableOpacity key={item.id} style={styles.itemContainer}>
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {item.bar_name}
              </Text>
              {item.menus?.length > 0 && (
                <Text style={styles.label}>인기메뉴</Text>
              )}
              <View style={styles.hashtagContainer}>
                {item.menus?.map((menu, idx) => (
                  <Text key={idx} style={styles.hashtag}>
                    #{menu.name}
                  </Text>
                ))}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (bookmarkIds?.has(item.id)) {
                  handleBookmarkToggle(item.id); // ❌ 해제
                } else {
                  handleTabPress("bookmark", { raw: item }); // ✅ 추가 시 SelectionListSheet 열기
                }
              }}
              style={styles.bookmarkIcon}
            >
              <Image
                source={
                  bookmarkIds?.has(item.id)
                    ? require("../assets/drawable/bookmark_checked.png")
                    : require("../assets/drawable/bookmark.png")
                }
                style={styles.bookmarkImage}
            />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheetScrollView>
  );
};


const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: widthPercentage(16),
    paddingBottom: heightPercentage(4),
    position: "relative",
  },
  tab: {
    marginHorizontal: widthPercentage(12),
  },
  text: {
    fontSize: fontPercentage(16),
    color: "#999",
  },
  activeText: {
    fontSize: fontPercentage(16),
    color: "#000",
    fontWeight: "bold",
  },
  underline: {
    height: heightPercentage(2),
    backgroundColor: "#000",
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  listContainer: {
    paddingHorizontal: widthPercentage(16),
    paddingVertical: heightPercentage(16),
    gap: heightPercentage(20),
  },
  itemContainer: {
    flexDirection: "row",
    marginTop: heightPercentage(12),
    backgroundColor: "#FFFCF3",
    paddingBottom: heightPercentage(12),
  },
  itemImage: {
    width: widthPercentage(126),
    height: heightPercentage(156),
    borderRadius: widthPercentage(8),
    backgroundColor: "#eee",
  },
  textContainer: {
    marginLeft: widthPercentage(12),
    width: widthPercentage(168),
    height: heightPercentage(48),
  },
  title: {
    fontSize: fontPercentage(18),
    fontWeight: "bold",
    marginBottom: heightPercentage(4),
  },
  label: {
    fontSize: fontPercentage(12),
    color: "#B9B6AD",
  },
  hashtagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: heightPercentage(8),
    width: widthPercentage(197),
    maxHeight: heightPercentage(50),
    overflow: "hidden",
  },
  hashtag: {
    backgroundColor: "#F3EFE6",
    color: "#7D7A6F",
    paddingVertical: heightPercentage(4),
    paddingHorizontal: widthPercentage(8),
    borderRadius: widthPercentage(20),
    fontSize: fontPercentage(12),
    textAlign: "center",
    marginRight: widthPercentage(4),
    marginBottom: heightPercentage(4),
    height: heightPercentage(24),
  },
  bookmarkIcon: {
    padding: widthPercentage(10),
  },
  bookmarkImage: {
    width: widthPercentage(24),
    height: heightPercentage(24),
    resizeMode: "contain",
    marginLeft: widthPercentage(12),
  },
});

export default SelectedRegions;