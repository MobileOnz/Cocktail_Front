import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, ScrollView, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const menuCategories = ["칵테일", "와인/샴페인", "맥주/하이볼", "위스키/보드카"];

const menuItems = [
  { id: 1, name: "메뉴 1", price: "15,000원", image: require("../assets/drawable/banner.jpg") },
  { id: 2, name: "메뉴 2", price: "18,000원", image: require("../assets/drawable/banner.jpg") },
  { id: 3, name: "메뉴 3", price: "20,000원", image: require("../assets/drawable/banner.jpg") },
  { id: 4, name: "메뉴 4", price: "22,000원", image: require("../assets/drawable/banner.jpg") },
];

const OperatingHours = () => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      {/* 운영시간 섹션 */}
      <TouchableOpacity style={styles.header} onPress={toggleExpansion}>
        <View style={styles.row}>
          <MaterialIcons name="schedule" size={20} color="black" />
          <Text style={styles.title}>영업중 · 24:00에 영업 종료</Text>
        </View>
        <MaterialIcons name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="black" />
      </TouchableOpacity>

      {/* 운영시간 상세 정보 (확장 시 표시) */}
      {expanded && (
        <View style={styles.details}>
          <Text style={styles.detailText}>월  16:00 - 24:00</Text>
          <Text style={styles.detailText}>화  16:00 - 24:00</Text>
          <Text style={styles.detailText}>수  16:00 - 24:00</Text>
          <Text style={styles.detailText}>목  16:00 - 24:00</Text>
          <Text style={styles.detailText}>금  16:00 - 24:00</Text>
          <Text style={styles.detailText}>토  16:00 - 24:00</Text>
          <Text style={styles.detailText}>일  16:00 - 24:00</Text>
        </View>
      )}
    </View>
  );
};

const MenuSection = () => {
  return (
    <View style={styles.menuContainer}>
      <Text style={styles.menuTitle}>메뉴</Text>
      
      {/* 메뉴 카테고리 선택 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {menuCategories.map((category, index) => (
          <TouchableOpacity key={index} style={styles.categoryButton}>
            <Text style={styles.categoryText}>{category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 메뉴 리스트 */}
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.menuItem}>
            <Image source={item.image} style={styles.menuImage} />
            <View style={styles.menuDetails}>
              <Text style={styles.menuName}>{item.name}</Text>
              <Text style={styles.menuPrice}>{item.price}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const MarketDetail = () => {
  return (
    <ScrollView style={styles.screen}>
      <OperatingHours />
      <MenuSection />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFCF3",
  },
  container: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  details: {
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#555",
    paddingVertical: 2,
  },
  menuContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryButton: {
    backgroundColor: "#F3EFE6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: "#7D7A6F",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  menuImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  menuDetails: {
    marginLeft: 12,
  },
  menuName: {
    fontSize: 16,
    fontWeight: "500",
  },
  menuPrice: {
    fontSize: 14,
    color: "#888",
  },
});

export default MarketDetail;
