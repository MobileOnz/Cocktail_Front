import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import MoreOptionMenu from "../Components/MoreOptionMenu";
import { PaperProvider } from "react-native-paper";
// 🔸 더미 데이터 배열
const dummyItems = [
  {
    listId: 1,
    title: "Label Bar 1",
    barAdress: "서울 강남구 강남대로 123",
    image: require("../assets/drawable/barExample.png"),
    hashtageList: ["#칵테일명", "#다른주류", "#안주명"],
  },
  {
    listId: 2,
    title: "Label Bar 2",
    barAdress: "서울 마포구 홍익로 456",
    image: require("../assets/drawable/barExample.png"),
    hashtageList: ["#칵테일", "#와인", "#안주"],
  },
  {
    listId: 3,
    title: "Label Bar 3",
    barAdress: "서울 종로구 종로 789",
    image: require("../assets/drawable/barExample.png"),
    hashtageList: ["#칵테일명", "#전통주", "#디저트"],
  },
];

const MyBardetailListBottomSheet = () => {
  const handleEdit = (id: number) => {
    console.log("Edit item", id);
  };

  const handleDelete = (id: number) => {
    console.log("Delete item", id);
  };

  return (
    <PaperProvider>
    <ScrollView>
      {dummyItems.map((item) => (
        <View key={item.listId} style={styles.itemContainer}>
          <Image style={styles.itemImage} source={item.image} />
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <View style={styles.addressRow}>
              <Feather name="map-pin" size={14} color="#7D7A6F" />
              <Text style={styles.itemAddress}>{item.barAdress}</Text>
            </View>
            <Text style={styles.menuText}>인기메뉴</Text>
            <View style={styles.hashtagContainer}>
              {item.hashtageList.map((tag, idx) => (
                <Text key={idx} style={styles.hashtag}>{tag}</Text>
              ))}
            </View>
          </View>
          <View style={styles.menuContainer}>
          <MoreOptionMenu
          itemId={item.listId}
          message="나의 리스트에서 삭제할까요?"
          onEdit={() => handleEdit(item.listId)}
          onDelete={() => handleDelete(item.listId)}
        />
           </View>
        </View>
      ))}
    </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
    menuContainer: {
        position: "absolute",
        top: heightPercentage(8),
        right: widthPercentage(40),
        zIndex: 100, // 혹시 다른 요소에 가려질 경우를 대비
      },
  itemContainer: {
    width: widthPercentage(375),
    height: heightPercentage(156),
    marginTop: heightPercentage(16),
    marginLeft: widthPercentage(16),
    backgroundColor: "#FFFCF3",
    flexDirection: "row",
    alignItems: "center",
    paddingRight: widthPercentage(8),
  },
  itemImage: {
    width: widthPercentage(126),
    height: heightPercentage(156),
    resizeMode: "cover",
  },
  textContainer: {
    flex: 1,
    marginLeft: widthPercentage(12),
  },
  itemTitle: {
    fontSize: fontPercentage(18),
    fontWeight: "bold",
    color: "#2D2D2D",
    marginBottom: heightPercentage(4),
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: heightPercentage(4),
  },
  itemAddress: {
    fontSize: fontPercentage(14),
    color: "#7D7A6F",
    marginLeft: widthPercentage(4),
  },
  menuText: {
    fontSize: fontPercentage(12),
    color: "#B9B6AD",
  },
  hashtagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: heightPercentage(8),
  },
  hashtag: {
    backgroundColor: "#F3EFE6",
    color: "#7D7A6F",
    paddingVertical: heightPercentage(4),
    paddingHorizontal: widthPercentage(8),
    borderRadius: widthPercentage(4),
    fontSize: fontPercentage(12),
    textAlign: "center",
    marginRight: widthPercentage(4),
    marginBottom: heightPercentage(4),
  },
});

export default MyBardetailListBottomSheet;
