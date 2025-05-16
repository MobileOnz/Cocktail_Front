import React, {useState, useEffect}from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import MoreOptionMenu from "../Components/MoreOptionMenu";
import { PaperProvider } from "react-native-paper";
import SelectionListSheet from "./SelectionListSheet";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_BASE_URL } from "@env";
import instance from "../tokenRequest/axios_interceptor";
// 🔸 더미 데이터 배열
// const dummyItems = [
//   {
//     listId: 1,
//     title: "Label Bar 1",
//     barAdress: "서울 강남구 강남대로 123",
//     image: require("../assets/drawable/barExample.png"),
//     hashtageList: ["#칵테일명", "#다른주류", "#안주명"],
//   },
//   {
//     listId: 2,
//     title: "Label Bar 2",
//     barAdress: "서울 마포구 홍익로 456",
//     image: require("../assets/drawable/barExample.png"),
//     hashtageList: ["#칵테일", "#와인", "#안주"],
//   },
//   {
//     listId: 3,
//     title: "Label Bar 3",
//     barAdress: "서울 종로구 종로 789",
//     image: require("../assets/drawable/barExample.png"),
//     hashtageList: ["#칵테일명", "#전통주", "#디저트"],
//   },
// ];

const MyBardetailListBottomSheet = ({listId}: {listId: number}) => {
  const [barList, setBarList] = useState([]);

  //수정하기 눌렀을 때 동작을 정의하기 위한 변수
  const [editBarId, setEditBarId] = useState<number | null>(null);
  const [showMoveSheet, setShowMoveSheet] = useState(false);

  const [myList, setMyList] = useState([]);
  useEffect(() => {
    const fetchMyList = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if(!token){
          console.warn("로그인이 필요합니다.");
          return;
        }
        const response = await instance.get("/api/item/public/list", {
          authRequired : true
        });
        const result = await response.data;
        if (result.code === 1) setMyList(result.data);
      } catch (e) {
        console.error("리스트 불러오기 실패", e);
      }
    };

    if (showMoveSheet) fetchMyList(); // 시트 열릴 때만
  }, [showMoveSheet]);


  useEffect(() => {
    const fetchBarList = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if(!token){
          console.warn("로그인이 필요합니다.");
          return;
        }
        const response = await instance.get(`/api/item/${listId}`, {
          authRequired : true
        });

        const result = await response.data;
        if (result.code === 1) {
          setBarList(result.data);
        } else {
          console.warn("가게 리스트 불러오기 실패:", result.msg);
        }
      } catch (error) {
        console.error("가게 불러오기 오류:", error);
      }
    };

    if (listId) fetchBarList();
  }, [listId]);

  //수정하기로 접근해 가게를 다른 리스트로 이동
  const moveBarToOtherList = async (barId: number, toListId: number) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
        if(!token){
          console.warn("로그인이 필요합니다.");
          return;
        }
        const response = await instance.post(
          "/api/item/move",
          {
            barId,
            fromListId: listId,
            toListId,
          },
          {
            authRequired: true,
          }
        );

        const result = response.data;
      if (result.code === 1) {
        console.log("이동 성공");
        setBarList((prev) => prev.filter((bar) => bar.id !== barId));
      } else {
        console.warn("이동 실패:", result.msg);
      }
    } catch (err) {
      console.error("이동 에러:", err);
    }
  };

  
  const handleEdit = (id: number) => {
    console.log("Edit item", id);
    setEditBarId(id);
    setShowMoveSheet(true);
  };

  const handleDelete = async (barId: number) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
        if(!token){
          console.warn("로그인이 필요합니다.");
          return;
        }
      const response = await fetch(`${API_BASE_URL}/api/item`, {
        method: "DELETE",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listId: listId,
          barId: barId,
        }),
      });
  
      const result = await response.json();
      if (result.code === 1) {
        console.log("삭제 성공");
  
        // ✅ 삭제 후 리스트 다시 불러오기 or 해당 항목만 제거
        setBarList(prev => prev.filter(item => item.id !== barId));
      } else {
        console.warn("삭제 실패:", result.msg);
      }
    } catch (error) {
      console.error("삭제 중 오류:", error);
    }
  };
  

  return (
    <PaperProvider>
      <ScrollView>
        {barList.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <Image style={styles.itemImage} source={{ uri: item.thumbnail }} />
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>{item.bar_name}</Text>
              {/* <View style={styles.addressRow}>
                <Feather name="map-pin" size={14} color="#7D7A6F" />
                <Text style={styles.itemAddress}>{item.address}</Text>
              </View> */}
              <Text style={styles.menuText}>인기메뉴</Text>
              <View style={styles.hashtagContainer}>
                {item.menus?.map((menu, idx) => (
                  <Text key={idx} style={styles.hashtag}>#{menu.name}</Text>
                ))}
              </View>
            </View>
            <View style={styles.menuContainer}>
              <MoreOptionMenu
                itemId={item.id}
                message="나의 리스트에서 삭제할까요?"
                onEdit={() => handleEdit(item.id)}
                onDelete={() => handleDelete(item.id)}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      {showMoveSheet && (
      <SelectionListSheet
        title="옮길 리스트 선택"
        listData={myList}
        onClose={() => setShowMoveSheet(false)}
        onSave={(selectedItem) => {
          if (!editBarId || !selectedItem) return;
          moveBarToOtherList(editBarId, selectedItem.id);
          setShowMoveSheet(false);
        }}
      />
    )}
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
    marginLeft: heightPercentage(4),
    marginTop: heightPercentage(4),
  },
  menuText: {
    fontSize: fontPercentage(12),
    color: "#B9B6AD",
    marginBottom: heightPercentage(4),
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
