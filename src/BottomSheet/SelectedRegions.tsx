import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import axios from "axios";
import { ScrollView } from "react-native-gesture-handler";
import { API_BASE_URL } from "@env";
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
};

const SelectedRegions = ({ selectedRegions = [], onRegionSelect }) => {
  const scrollRef = useRef(null);
  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;

  const [activeRegion, setActiveRegion] = useState(null);
  const [barList, setBarList] = useState([]);
  const regionLayouts = useRef({});

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
    if (!regionCode) {
      console.warn("지역 코드 없음:", region);
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/location/filter`,
        {
          params: { areaCodes: regionCode },
        }
      );
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

  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* 지역 탭 */}
      <View>
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
      </View>
  
      {/* 바 리스트 */}
      <View style={styles.listContainer}>
        {barList.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <Image source={{ uri: item.thumbnail }} style={styles.image} />
            <View style={styles.infoContainer}>
              <Text style={styles.title}>{item.bar_name}</Text>
              <Text style={styles.address}>{item.address}</Text>
              {item.menus && item.menus.length > 0 && (
                <Text style={styles.label}>인기메뉴</Text>
              )}  
              <View style={styles.tags}>          
                {item.menus && item.menus.length > 0 && (
                  <>
                  
                    {item.menus.map((menu, idx) => (
                      <Text key={idx} style={styles.tag}>
                        #{menu.name}
                      </Text>
                    ))}
                  </>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    </BottomSheetScrollView>
  );
  
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 4,
    position: "relative",
    paddingHorizontal: 16,
  },
  tab: {
    marginHorizontal: 12,
  },
  text: {
    fontSize: 16,
    color: "#999",
  },
  activeText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
  underline: {
    height: 2,
    backgroundColor: "#000",
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 20,
  },
  itemContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#eee",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  address: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 8,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: "#F3EFE6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    color: "#7D7A6F",
    marginRight: 4,
  },
});

export default SelectedRegions;
