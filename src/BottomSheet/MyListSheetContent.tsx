import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import MoreOptionMenu from "../Components/MoreOptionMenu";
import { PaperProvider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import BottomSheet, { BottomSheetFlatList, BottomSheetScrollView } from "@gorhom/bottom-sheet";
const myList = [
  {
    id: "1",
    name: "메인 컨셉",
    location: "999",
    tags: ["#Sub", "#Sub", "#Sub"],
    icon: require("../assets/drawable/listicon1.png"),
  },
  {
    id: "2",
    name: "메인 컨셉",
    location: "999",
    tags: ["#Sub", "#Sub", "#Sub"],
    icon: require("../assets/drawable/listicon2.png"),
  },
  {
    id: "3",
    name: "메인 컨셉",
    location: "999",
    tags: ["#Sub", "#Sub", "#Sub"],
    icon: require("../assets/drawable/listicon2.png"),
  },
  {
    id: "4",
    name: "메인 컨셉",
    location: "999",
    tags: ["#Sub", "#Sub", "#Sub"],
    icon: require("../assets/drawable/listicon2.png"),
  },
  {
    id: "5",
    name: "메인 컨셉",
    location: "999",
    tags: ["#Sub", "#Sub", "#Sub"],
    icon: require("../assets/drawable/listicon2.png"),
  },
  {
    id: "6",
    name: "메인 컨셉",
    location: "999",
    tags: ["#Sub", "#Sub", "#Sub"],
    icon: require("../assets/drawable/listicon3.png"),
  },
];

const MyListSheetContent =  ({handleTabPress}) => {
  const navigation = useNavigation();
  const handleEdit = (itemId) => {
    console.log(`Editing item with id: ${itemId}`);
  };

  const handleDelete = (itemId) => {
    console.log(`Deleting item with id: ${itemId}`);
  
  };
  return (
    <PaperProvider>
    
    {/*  ScrollView 대신 BottomSheetFlatList 사용 */}
    <BottomSheetFlatList
      style={styles.container}
      data={myList}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>나의 리스트</Text>
            <View style={styles.line}></View>
          </View>
  
          {/* 새 리스트 만들기 버튼 */}
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
        
        <TouchableOpacity onPress={() => {
          console.log(`Clicked item: ${item}`);
          handleTabPress("myBardetailList", item)
        }
        }>

        <View style={styles.listItem}>
          <Image source={item.icon} style={styles.icon} />
          <View style={styles.info}>
            <Text style={styles.barName}>{item.name}</Text>
            <View style={styles.location}>
              <Feather name="map-pin" size={14} color="#7D7A6F" />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
            <View style={styles.tagContainer}>
              {item.tags.map((tag, index) => (
                <Text key={index} style={styles.tag}>{tag}</Text>
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
