import React, {useState} from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { BottomSheetSectionList } from "@gorhom/bottom-sheet";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";


type myBarList = {
  listId: number;
  title: string;
  barAdress: string;
  image: any;
  hashtageList: string[];
};




const MainBottomSheet = ({ sections, showMyBars, handleTabPress }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const toggleShowMyBars = () => {
    setIsExpanded(!isExpanded);
  };
  const getFilteredSections = () => {
    return sections.map((section) => {
      if (section.title === "나의 칵테일 바") {
        return {
          ...section, // 기존 데이터 유지
          data: isExpanded ? section.data : section.data.slice(0, 1), // 참이면 데이터 유지, 아니면 슬라이스스
        };
      }
      return section;
    });
  };
   /*함수를 통해 아이템 리스트너 꾸미기*/ 
  const renderBarItem = ({ item, index, section }: { item: myBarList; index: number; section: any }) => (
    <>
    <TouchableOpacity onPress={() => handleTabPress("detail")}>
      <View style={styles.itemContainer}>
        <Image style={styles.itemImage} source={item.image} />
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDistance}>{item.barAdress}</Text>
        <Text style={{ color: "#B9B6AD", fontSize: fontPercentage(12) }}>인기메뉴</Text>
        <View style={styles.hashtagContainer}>
          {item.hashtageList.map((tag, idx) => (
            <Text key={idx} style={styles.hashtag}>{tag}</Text>
          ))}
        </View>
      </View>
      {/* 책갈피 아이콘 */}
      <TouchableOpacity onPress={() => handleTabPress("bookmark", item)}>
        <Image source={require("../assets/drawable/bookmark.png")} style={styles.bookmarkImage} />
      </TouchableOpacity>

    </View>
    </TouchableOpacity>
      {section.title === "나의 칵테일 바" && index === section.data.length - 1 && (
        <TouchableOpacity style={styles.toggleButton} onPress={toggleShowMyBars}>
          <Text style={styles.toggleText}>{isExpanded ? "접기" : "더보기"}</Text>
        </TouchableOpacity>
      )}
    </>
  );

  const renderSectionHeader = ({ section }: any) => (
    <View style={styles.myListContainer}>
      <Text style={styles.text}>{section.title}</Text>
      <View style={styles.barLine} />
    </View>
  );


  

  return (
      <BottomSheetSectionList
        sections={getFilteredSections()}
        keyExtractor={(item) => item.listId.toString()}
        renderItem={renderBarItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
      />
  );
};

const styles = StyleSheet.create({
  myListContainer: {
    marginTop: heightPercentage(24),
    marginLeft: widthPercentage(16),
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: fontPercentage(18),
    fontWeight: "700",
    color: "#2D2D2D",
    marginRight: widthPercentage(12),
  },
  barLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E4DFD8",
  },
  itemContainer: {
    width: widthPercentage(375),
    height: heightPercentage(156),
    marginTop: heightPercentage(16),
    marginLeft: widthPercentage(16),
    backgroundColor: "#FFFCF3",
    flexDirection: "row",
  },
  textContainer: {
    marginLeft: widthPercentage(12),
    width: widthPercentage(168),
    height: heightPercentage(48),
  },
  itemImage: {
    width: widthPercentage(126),
    height: heightPercentage(156),
  },
  hashtagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: heightPercentage(8),
    width: widthPercentage(197),
    height: heightPercentage(50),
    maxHeight: heightPercentage(52),
  },
  hashtag: {
    backgroundColor: "#F3EFE6",
    color: "#7D7A6F",
    paddingVertical: heightPercentage(4),
    paddingHorizontal: widthPercentage(8),
    borderRadius: widthPercentage(4),
    fontSize: fontPercentage(12),
    textAlign: "center",
    marginBottom: heightPercentage(4),
  },
  itemTitle: {
    fontSize: fontPercentage(18),
    fontWeight: "bold",
    marginBottom: heightPercentage(4),
  },
  itemDistance: {
    fontSize: fontPercentage(14),
    color: "#7D7A6F",
  },
  toggleButton: {
    alignSelf: "center",
    marginVertical: heightPercentage(16),
    paddingVertical: heightPercentage(8),
    paddingHorizontal: widthPercentage(24),
    borderWidth: 1,
    borderColor: "#D1C9BA",
    borderRadius: widthPercentage(8),
  },
  toggleText: {
    fontSize: fontPercentage(14),
    color: "#7D7A6F",
  },
  bookmarkIcon: {
    padding: widthPercentage(10),
  },
  bookmarkImage: {
    width: widthPercentage(24),
    height: heightPercentage(24),
    resizeMode: "contain",
  },
  bookmarkContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});

export default MainBottomSheet;
