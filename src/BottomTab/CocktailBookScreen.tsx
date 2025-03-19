import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ScrollView,
  SafeAreaView,
  TouchableOpacity
} from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads"; 
import CocktailDetailModal from "../Components/CocktailDetailModal";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";

const bannerImages = [
  require("../assets/drawable/banner.jpg"),
  require("../assets/drawable/banner.jpg"),
];
const categories = [
  { 
    title: "우아한 클래식", 
    description: "격식을 갖춘 품격있는 칵테일", 
    icon: require("../assets/drawable/classic.png"), 
    textColor: "#5D8A78",
    backgroundColor: "#E4F0E9"
  },
  { 
    title: "달콤한 파티", 
    description: "분위기를 띄워 줄 화려한 칵테일", 
    icon: require("../assets/drawable/party.png"), 
    textColor: "#D38456",
    backgroundColor: "#FBE5D6"
  },
  { 
    title: "은은한 무드", 
    description: "조용한 밤을 위한 부드러운 칵테일", 
    icon: require("../assets/drawable/mood.png"), 
    textColor: "#B47B6C",
    backgroundColor: "#F3DED7"
  },
  { 
    title: "청량한 여름", 
    description: "태양 아래 시원하게 즐기는 칵테일", 
    icon: require("../assets/drawable/summer.png"), 
    textColor: "#5478C1",
    backgroundColor: "#DCE7F9"
  },
  { 
    title: "강렬한 한 잔", 
    description: "깊고 묵직한 분위기를 가진 칵테일", 
    icon: require("../assets/drawable/one_shot.png"), 
    textColor: "#C14C4C",
    backgroundColor: "#F4D6D6"
  },
  { 
    title: "부담 없는 시작", 
    description: "칵테일 입문자를 위한 가벼운 선택", 
    icon: require("../assets/drawable/start.png"), 
    textColor: "#A78A64",
    backgroundColor: "#F1E6D5"
  }
];


const cocktails = [
  { 
    id: "1", 
    name: "칵테일 명", 
    image: require("../assets/drawable/cocktail.jpg"),
    description: "칵테일 소개 한줄입니다.",
    size: "120ml",
    taste: "새콤한 맛, 약간 짠 맛",
    alcohol: "약 13~15%",
    recommendation: "더운 날 해변에서, 가벼운 식사와 함께 하는 것을 추천합니다.",
    ingredients: "데킬라, 라임 주스, 오렌지 리큐어",
  },
  { 
    id: "2", 
    name: "칵테일 명", 
    image: require("../assets/drawable/cocktail.jpg"),
    description: "칵테일 소개 한줄입니다.",
    size: "150ml",
    taste: "달콤한 맛",
    alcohol: "약 5~7%",
    recommendation: "디저트와 함께 즐기기 좋은 칵테일입니다.",
    ingredients: "럼, 코코넛 밀크, 파인애플 주스",
  },
  { 
    id: "3", 
    name: "칵테일 명", 
    image: require("../assets/drawable/cocktail.jpg"),
    description: "칵테일 소개 한줄입니다.",
    size: "180ml",
    taste: "묵직한 맛, 쌉싸름한 맛",
    alcohol: "약 20~25%",
    recommendation: "저녁에 진한 음식을 곁들여 마시기 좋습니다.",
    ingredients: "위스키, 진저 비어, 라임",
  },
];

const CocktailBookScreen: React.FC = () => {
  const [selectedCocktail, setSelectedCocktail] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const bannerRef = useRef<FlatList<any>>(null);
  const [selectedCocktailIndex, setSelectedCocktailIndex] = useState<number | null>(null);
  const openModal = (cocktail: any) => {
    const index = cocktails.findIndex((c) => c.id === cocktail.id);  // ✅ 인덱스 찾기
    setSelectedCocktailIndex(index);
    setSelectedCocktail(cocktail);
  };
  

  const closeModal = () => {
    setSelectedCocktail(null);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    console.log("onViewableItemsChanged 호출됨");
    console.log("viewableItems:", viewableItems);
  
    if (!viewableItems || !Array.isArray(viewableItems) || viewableItems.length === 0) {
      return;
    }
    
    setCurrentPage(viewableItems[0]?.index + 1 || 1);
  }).current;
  
  
  
  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container}>
        {/* 상단 로고 & 아이콘 */}
        <View style={styles.header}>
          <Image source={require("../assets/drawable/Logo.jpg")} style={styles.logo} />
          <Image source={require("../assets/drawable/find.png")} style={styles.icon} />
        </View>

        {/* 배너 슬라이더 */}
        <View style={styles.bannerContainer}>
          <FlatList
            ref={bannerRef}
            horizontal
            pagingEnabled
            data={bannerImages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={item} style={styles.bannerImage} />
            )}
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 1 }}
          />
          {/* 페이지 표시 */}
          <View style={styles.pageIndicator}>
            <Text style={styles.pageText}>{currentPage} / {bannerImages.length}</Text>
          </View>
        </View>


        {/* 📌 광고 배너 추가 */}
        <View style={styles.adContainer}>
          <BannerAd
            unitId={TestIds.BANNER}  // 🛑 실제 앱에서는 Google AdMob ID로 변경
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>

        {/* 분위기별 칵테일 리스트 */}
        {categories.map((category, index) => (
          <View key={index} style={styles.categorySection}>
            {/* 카테고리 제목 */}
            <View style={styles.categoryHeader}>
              <Image source={category.icon} style={styles.categoryIcon} />
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <View style={[styles.categoryDescriptionContainer, { backgroundColor: category.backgroundColor}]}>
                <Text style={[styles.categoryDescription, {color: category.textColor}]}>{category.description}</Text>
              </View>
            </View>

            {/* 칵테일 리스트 (가로 스크롤) */}
            <FlatList
              horizontal
              data={cocktails}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => openModal(item)} style={styles.cocktailCard}>
                  <Image source={item.image} style={styles.cocktailImage} />
                  <Text style={styles.cocktailName}>{item.name}</Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        ))}
      </ScrollView>

      {/* 모달 */}
      {selectedCocktail !== null && selectedCocktailIndex !== null && (
        <CocktailDetailModal
          visible={true}
          onClose={closeModal}
          cocktailIndex={selectedCocktailIndex}
          cocktails={cocktails}
        />
      )}
    </SafeAreaView>
  );
};

export default CocktailBookScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#FFFCF3",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFCF3",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: widthPercentage(15),
    paddingVertical: heightPercentage(10),
  },
  recommendationSection: {
    width: "100%",
    alignItems: "center",
    paddingBottom: heightPercentage(20),
  },
  recommendationText: {
    fontSize: fontPercentage(18),
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  categorySection: {
    paddingHorizontal: widthPercentage(15),
    marginBottom: heightPercentage(20),
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: heightPercentage(10),
  },
  categoryTitle: {
    fontSize: fontPercentage(16),
    fontWeight: "bold",
    color: "#444",
  },
  categoryIcon: {
    width: widthPercentage(30),
    height: widthPercentage(30),
    marginRight: widthPercentage(10),
  },
  cocktailCard: {
    width: widthPercentage(152),
    alignItems: "center",
    marginRight: widthPercentage(15),
  },
  cocktailImage: {
    width: widthPercentage(152),
    height: heightPercentage(114),
    borderRadius: widthPercentage(10),
  },
  cocktailName: {
    fontSize: fontPercentage(14),
    fontWeight: "bold",
    color: "#333",
    marginTop: heightPercentage(5),
  },
  icon: {
    width: widthPercentage(28),
    height: widthPercentage(28),
  },
  recommendationImage: {
    width: widthPercentage(375),
    height: heightPercentage(285),
  },
  categoryDescriptionContainer: {
    backgroundColor: "#F5F6EE",
    borderRadius: widthPercentage(8),
    paddingHorizontal: widthPercentage(10),
    paddingVertical: heightPercentage(4),
    marginLeft: widthPercentage(10),
  },
  categoryDescription: {
    fontSize: fontPercentage(11),
    color: "#7DACA4",
  },
  logo: {
    width: widthPercentage(110),
    height: heightPercentage(45),
    resizeMode: "contain",
  },
  bannerContainer: {
    position: "relative",
    width: widthPercentage(375), // 피그마 기준
    height: heightPercentage(285),
    borderRadius: widthPercentage(10),
    marginVertical: heightPercentage(15),
  },
  bannerImage: {
    width: widthPercentage(375),
    height: heightPercentage(285),
    resizeMode: "cover",
  },
  pageIndicator: {
    position: "absolute",
    bottom: heightPercentage(10),
    right: widthPercentage(15),
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: widthPercentage(8),
    paddingVertical: heightPercentage(4),
    borderRadius: widthPercentage(10),
  },
  pageText: {
    color: "#FFF",
    fontSize: fontPercentage(14),
    fontWeight: "bold",
  },
  adContainer: {
    alignItems: "center",
    marginVertical: heightPercentage(15),
  },

});