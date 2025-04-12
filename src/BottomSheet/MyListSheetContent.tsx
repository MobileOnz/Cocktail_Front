import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  widthPercentage,
  heightPercentage,
  fontPercentage,
} from "../assets/styles/FigmaScreen";
import MoreOptionMenu from "../Components/MoreOptionMenu";
import { PaperProvider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ScrollView } from "react-native-gesture-handler";
import instance from "../tokenRequest/axios_interceptor";

const server = API_BASE_URL;

interface MyListItem {
  id: string;
  name: string;
  location: string;
  tags: string[];
  icon_tag: number;
}

const imageMap = {
  1: require("../assets/newListIcon/Name=Classic_Status=Default.png"),
  2: require("../assets/newListIcon/Name=Light_Status=Default.png"),
  3: require("../assets/newListIcon/Name=Party_Status=Default.png"),
  4: require("../assets/newListIcon/Name=Play_Status=Default.png"),
  5: require("../assets/newListIcon/Name=Primary_Status=Default.png"),
  6: require("../assets/newListIcon/Name=Shine_Status=Default.png"),
  7: require("../assets/newListIcon/Name=Summer_Status=Default.png"),
};

const MyListSheetContent = ({ handleTabPress }) => {
  const navigation = useNavigation();
  const [myList, setMyList] = useState<MyListItem[]>([]);

const fetchMyList = async () => {
  
  try {
    const response = await instance.get('/api/list/all');

    const transformed = response.data.data.map((item) => ({
      id: item.id.toString(),
      name: item.main_tag.name,
      location: null,
      tags: Object.values(item.sub_tags)
        .flat()
        .map((tag) => `#${tag.name}`),
      icon_tag: item.icon_tag ?? 1,
    }));

    setMyList(transformed);
  } catch (error) {
    console.error('나의 리스트 가져오기 실패:', error);

    if (error.message === '리프레시 토큰 만료') {
     navigation.navigate("Login" as never);
    }
  }
};

  useFocusEffect(
    useCallback(() => {
      fetchMyList();
    }, [])
  );

  const handleEdit = (itemId : number) => {
    navigation.navigate("CreateNewListScreen" as never, {
    editMode: true,
    itemId: itemId,
  } as never);
    
  };

  const handleDelete = async (itemId : number) => {
    try {
      await instance.delete(`/api/list/${itemId}`);
    console.log(`리스트 ${itemId} 삭제 완료`);
    fetchMyList(); 
    } catch (error) {
      console.error("리스트 삭제 실패:", error);
      if (error.message === '리프레시 토큰 만료') {
        navigation.navigate("Login" as never);
       }

    }
  };

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>나의 리스트</Text>
          <View style={styles.line}></View>
        </View>

        <TouchableOpacity
          style={styles.newListButton}
          onPress={() =>
            navigation.navigate("CreateNewListScreen" as never)
          }
        >
          <Image
            source={require("../assets/drawable/newlist.png")}
            style={styles.newlistImage}
          />
          <Text style={styles.newListText}>새 리스트 만들기</Text>
        </TouchableOpacity>

        {myList.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              handleTabPress("myBardetailList", item);
            }}
          >
            <View style={styles.listItem}>
              <Image
                source={
                  imageMap[item.icon_tag] || require("../assets/drawable/classic.png")
                }
                style={styles.icon}
              />
              <View style={styles.info}>
                <Text style={styles.barName}>{item.name}</Text>
                <View style={styles.tagContainer}>
                  {item.tags.map((tag, index) => (
                    <Text key={index} style={styles.tag}>
                      {tag}
                    </Text>
                  ))}
                </View>
              </View>

              <MoreOptionMenu
                itemId={item.id}
                onEdit={handleEdit}
                onDelete={handleDelete}
                message={`"${item.name}" 리스트 메뉴입니다.`}
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </PaperProvider>
  );
};

export default MyListSheetContent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFCF3",
  },
  headerContainer : {
    marginTop: heightPercentage(28),
    paddingLeft : widthPercentage(12),
    marginBottom : heightPercentage(20),
    flexDirection: "row",
    alignItems: "center",
  },
  header: {
    fontSize: fontPercentage(18),
    fontWeight: "700",
    color: "#2D2D2D",
    marginRight : widthPercentage(12),
  },
  line : {
    flex : 1,
    marginRight : widthPercentage(12),
    height: 2,
    backgroundColor: "#E4DFD8"
  },
  newlistImage :{
    width: 32, 
    aspectRatio: 1, 
    resizeMode: "contain",
    marginRight : widthPercentage(12),
  },
  newListButton: {
    flexDirection: "row",
    marginLeft : widthPercentage(20),
    marginRight : widthPercentage(20),
    borderBottomWidth : 1,
    borderColor : "#F3EFE6",
    paddingVertical : heightPercentage(12),
  },
  newListText: {
    marginVertical : heightPercentage(10),
    fontWeight : "500",
    fontSize : fontPercentage(16),
    color: "#7D7A6F",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFCF3",
    padding: 12,
    borderBottomColor : "FFF",
    elevation: 2,
  },
  icon: {
    width: 32,
    height: 32,
    resizeMode : "contain",
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
  menuButton: {
    padding: 8,
  },
});
