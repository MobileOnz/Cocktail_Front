import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from "react-native";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import { useNavigation } from "@react-navigation/native";

// Props 정의
interface SelectionListSheetProps {
  title: string;
  listData: ListItem[];
  onClose: () => void;
  onSave: (selectedItem: ListItem | null) => void;
}

interface ListItem {
  id: string;
  name: string;
  location: string;
  tags: string[];
  icon: any;
}

const SelectionListSheet: React.FC<SelectionListSheetProps> = ({ title, listData, onClose, onSave }) => {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* 헤더 영역 */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={onClose}>
          <Image source={require("../assets/drawable/close.png")} style={styles.closeIcon} />
        </TouchableOpacity>
      </View>

      {/* 새 리스트 만들기 버튼 */}
      <TouchableOpacity style={styles.newListButton} onPress={() => navigation.navigate("CreateNewListScreen" as never)}>
        <Image source={require("../assets/drawable/newlist.png")} style={styles.newlistImage} />
        <Text style={styles.newListText}>새 리스트 만들기</Text>
      </TouchableOpacity>

      {/* 리스트 목록 */}
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Image source={item.icon} style={styles.icon} />
            <View style={styles.info}>
              <Text style={styles.barName}>{item.name}</Text>
              <View style={styles.location}>
                <Text style={styles.locationText}>{item.location}</Text>
              </View>
              <View style={styles.tagContainer}>
                {item.tags.map((tag, index) => (
                  <Text key={index} style={styles.tag}>
                    {tag}
                  </Text>
                ))}
              </View>
            </View>

            {/* 체크박스 */}
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setSelectedListId(item.id)}>
              {selectedListId === item.id ? (
                <Image source={require("../assets/drawable/checkbox_checked.png")} style={styles.checkbox} />
              ) : (
                <Image source={require("../assets/drawable/checkbox_unchecked.png")} style={styles.checkbox} />
              )}
            </TouchableOpacity>
          </View>
        )}
      />

      {/* 저장하기 버튼 */}
      <TouchableOpacity style={styles.saveButton} onPress={() => onSave(listData.find((item) => item.id === selectedListId) || null)}>
        <Text style={styles.saveText}>저장하기</Text>
      </TouchableOpacity>
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    padding: widthPercentage(16),
    backgroundColor: "#FFFCF3",
    borderTopLeftRadius: widthPercentage(16),
    borderTopRightRadius: widthPercentage(16),
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: heightPercentage(12),
    position: "relative",
  },
  title: {
    fontSize: fontPercentage(18),
    fontWeight: "bold",
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -widthPercentage(50)}],
  },
  closeIcon: {
    position: "absolute",
    right: 0,
    width: widthPercentage(18),
    height: heightPercentage(18),
    resizeMode: "contain",
  },
  newListButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: heightPercentage(12),
    marginTop: heightPercentage(12),
    marginBottom: heightPercentage(12),
  },
  newlistImage: {
    width: widthPercentage(24),
    height: heightPercentage(24),
    marginRight: widthPercentage(12),
  },
  newListText: {
    fontSize: fontPercentage(16),
    color: "#7D7A6F",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: heightPercentage(12),
    borderBottomWidth: 1,
    borderColor: "#E4DFD8",
  },
  icon: {
    width: widthPercentage(32),
    height: heightPercentage(32),
    resizeMode: "contain",
    marginRight: widthPercentage(12),
  },
  info: {
    flex: 1,
  },
  barName: {
    fontSize: fontPercentage(16),
    fontWeight: "bold",
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: heightPercentage(4),
  },
  locationText: {
    fontSize: fontPercentage(12),
    color: "#7D7A6F",
  },
  tagContainer: {
    flexDirection: "row",
  },
  tag: {
    backgroundColor: "#F3EFE6",
    paddingHorizontal: widthPercentage(8),
    paddingVertical: heightPercentage(4),
    borderRadius: widthPercentage(8),
    fontSize: fontPercentage(12),
    color: "#7D7A6F",
    marginRight: widthPercentage(4),
  },
  checkboxContainer: {
    padding: widthPercentage(8),
  },
  checkbox: {
    width: widthPercentage(24),
    height: heightPercentage(24),
    resizeMode: "contain",
  },
  saveButton: {
    marginTop: heightPercentage(16),
    paddingVertical: heightPercentage(12),
    backgroundColor: "#21103C",
    borderRadius: widthPercentage(8),
    alignItems: "center",
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: fontPercentage(16),
    fontWeight: "bold",
  },
});

export default SelectionListSheet;
