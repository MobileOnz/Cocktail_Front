// CocktailBookScreen.tsx

import React, { useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  FlatList, 
  ScrollView, 
  Dimensions, 
  SafeAreaView, 
  TouchableOpacity 
} from "react-native";
import CocktailDetailModal from "../Components/CocktailDetailModal";

const { width } = Dimensions.get("window");

const categories = [
  { title: "우아한 클래식", description: "격식을 갖춘 품격있는 칵테일" },
  { title: "은은한 무드", description: "조용한 밤을 위한 부드러운 칵테일" },
  { title: "청량한 여름", description: "태양 아래 시원하게 즐기는 칵테일" },
  { title: "강렬한 한 잔", description: "깊고 묵직한 분위기를 가진 칵테일" },
  { title: "부담 없는 시작", description: "칵테일 입문자를 위한 가벼운 선택" },
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

  const openModal = (cocktail: any) => {
    setSelectedCocktail(cocktail);
  };

  const closeModal = () => {
    setSelectedCocktail(null);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container}>
        {/* 상단 로고 & 아이콘 */}
        <View style={styles.header}>
          <Image source={require("../assets/drawable/Logo.jpg")} style={styles.logo} />
          <Image source={require("../assets/drawable/allocation.jpg")} style={styles.icon} />
        </View>

        {/* 추천 배너 */}
        <View style={styles.recommendationSection}>
          <Image source={require("../assets/drawable/banner.jpg")} style={styles.recommendationImage} />
          <Text style={styles.recommendationText}>
            봄에 가볍게 한잔하기 좋은{"\n"}마포구 칵테일 10곳
          </Text>
        </View>

        {/* 분위기별 칵테일 리스트 */}
        {categories.map((category, index) => (
          <View key={index} style={styles.categorySection}>
            {/* 카테고리 제목 */}
            <View style={styles.categoryHeader}>
              <Image source={require("../assets/drawable/allocation.jpg")} style={styles.categoryIcon} />
              <View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
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
      {selectedCocktail && (
        <CocktailDetailModal
          visible={true}
          onClose={closeModal}
          cocktail={selectedCocktail}
        />
      )}
    </SafeAreaView>
  );
};

export default CocktailBookScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  logo: {
    width: width * 0.3, 
    height: width * 0.1,
    resizeMode: "contain",
  },
  icon: {
    width: 30,
    height: 30,
  },
  recommendationSection: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 20,
  },
  recommendationImage: {
    width: width * 0.9,
    height: width * 0.5,
    borderRadius: 10,
    marginVertical: 15,
  },
  recommendationText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  categorySection: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
  },
  categoryDescription: {
    fontSize: 14,
    color: "#666",
  },
  cocktailCard: {
    width: width * 0.3,
    alignItems: "center",
    marginRight: 15,
  },
  cocktailImage: {
    width: "100%",
    height: width * 0.35,
    borderRadius: 10,
  },
  cocktailName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
});
