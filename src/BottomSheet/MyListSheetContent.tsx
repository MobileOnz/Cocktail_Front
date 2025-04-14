import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "@env";
import MoreOptionMenu from "../Components/MoreOptionMenu";
import Feather from "react-native-vector-icons/Feather";
import {
  widthPercentage,
  heightPercentage,
  fontPercentage,
} from "../assets/styles/FigmaScreen";

const MyListSheetContent = ({ handleTabPress, bookmarkedBars }) => {
  const navigation = useNavigation();
  const server = API_BASE_URL;

  const handleEdit = (itemId: number) => {
    navigation.navigate("CreateNewListScreen" as never, {
      editMode: true,
      itemId: itemId,
    } as never);
  };

  const handleDelete = async (itemId: number) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;

      await axios.delete(`${server}/api/list/${itemId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      console.log(`리스트 ${itemId} 삭제 완료`);
    } catch (error) {
      console.error("리스트 삭제 실패:", error);
    }
  };

  return (
    <PaperProvider>
      <BottomSheetFlatList
        data={bookmarkedBars}
        keyExtractor={(item) => item.id.toString()}
        style={styles.container}
        ListHeaderComponent={
          <>
            <View style={styles.headerContainer}>
              <Text style={styles.header}>나의 리스트</Text>
              <View style={styles.line}></View>
            </View>

            <TouchableOpacity
              style={styles.newListButton}
              onPress={() => navigation.navigate("CreateNewListScreen" as never)}
            >
              <Image
                source={require("../assets/drawable/newlist.png")}
                style={styles.newlistImage}
              />
              <Text style={styles.newListText}>새 리스트 만들기</Text>
            </TouchableOpacity>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleTabPress("myBardetailList", item)}>
            <View style={styles.listItem}>
              <Image
                source={{ uri: item.thumbnail }}
                style={styles.icon}
              />
              <View style={styles.info}>
                <Text style={styles.barName}>{item.bar_name}</Text>
                <View style={styles.location}>
                  <Feather name="map-pin" size={14} color="#7D7A6F" />
                  <Text style={styles.locationText}>{item.address ?? "주소 없음"}</Text>
                </View>
                <View style={styles.tagContainer}>
                  {item.menus?.map((menu, index) => (
                    <Text key={index} style={styles.tag}>#{menu.name}</Text>
                  ))}
                </View>
              </View>
              <MoreOptionMenu itemId={item.id} onEdit={handleEdit} onDelete={handleDelete} />
            </View>
          </TouchableOpacity>
        )}
      />
    </PaperProvider>
  );
};

export default MyListSheetContent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFCF3",
  },
  headerContainer: {
    marginTop: heightPercentage(28),
    paddingLeft: widthPercentage(12),
    marginBottom: heightPercentage(20),
    flexDirection: "row",
    alignItems: "center",
  },
  header: {
    fontSize: fontPercentage(18),
    fontWeight: "700",
    color: "#2D2D2D",
    marginRight: widthPercentage(12),
  },
  line: {
    flex: 1,
    marginRight: widthPercentage(12),
    height: 2,
    backgroundColor: "#E4DFD8",
  },
  newlistImage: {
    width: 32,
    aspectRatio: 1,
    resizeMode: "contain",
    marginRight: widthPercentage(12),
  },
  newListButton: {
    flexDirection: "row",
    marginLeft: widthPercentage(20),
    marginRight: widthPercentage(20),
    borderBottomWidth: 1,
    borderColor: "#F3EFE6",
    paddingVertical: heightPercentage(12),
  },
  newListText: {
    marginVertical: heightPercentage(10),
    fontWeight: "500",
    fontSize: fontPercentage(16),
    color: "#7D7A6F",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFCF3",
    padding: 12,
    borderBottomColor: "#FFF",
    elevation: 2,
  },
  icon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  barName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2D2D2D",
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  locationText: {
    fontSize: 12,
    color: "#7D7A6F",
    marginLeft: 4,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#F3EFE6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    color: "#7D7A6F",
    marginRight: 4,
    marginTop: 4,
  },
});
