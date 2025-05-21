import React, {useEffect, useState} from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { BottomSheetSectionList } from "@gorhom/bottom-sheet";
import { widthPercentage, heightPercentage, fontPercentage, getResponsiveHeight } from "../assets/styles/FigmaScreen";

type myBarList = {
  id: number;
  title: string;
  barAdress: string;
  thumbNail: any;
  hashtagList: string[];
};




const MainBottomSheet = ({ sections, showMyBars, handleTabPress, setSelectedTab, setSelectedBarId, bookmarkIds, setBookmarkIds, bookmarkListMap, setBookmarkListMap, handleBookmarkToggle }) => {
  const [isExpanded, setIsExpanded] = useState(true);
const [originalMyBarsLength, setOriginalMyBarsLength] = useState(0);

useEffect(() => {
  const myBarSection = sections.find(section => section.title === "나의 칵테일 바");
  if (myBarSection) {
    setOriginalMyBarsLength(myBarSection.data.length);
  }
}, [sections]);
  const toggleShowMyBars = () => {
    setIsExpanded(!isExpanded);
  };

  const getFilteredSections = () => {
    return sections.map((section) => {
      if (section.title === "나의 칵테일 바") {
        return {
          ...section, // 기존 데이터 유지
          data: isExpanded ? section.data : section.data.slice(0, 2), // 참이면 데이터 유지, 아니면 슬라이스스
        };
      }
      return section;
    });
  };
   /*함수를 통해 아이템 리스트너 꾸미기*/ 
  const renderBarItem = ({ item, index, section }: { item: myBarList; index: number; section: any }) => (
  
    <>
      <TouchableOpacity
        onPress={() => {
          // setSelectedBarId(item.id);  // ✅ 상세조회용 바 ID 저장
          console.log("✅ 바 디테일 보기로 전달:", item);
          // setSelectedTab("detail", item);       // ✅ 상세 탭으로 전환
          handleTabPress("detail", item);
        }}
      >
      <View style={styles.itemContainer}>
        <Image style={styles.itemImage} source={item.thumbNail} />
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
        
        {item.hashtagList && item.hashtagList.length >0 &&(
           <Text style={{ color: "#B9B6AD", fontSize: fontPercentage(12),marginTop : getResponsiveHeight(4,4,4,7,8,10),marginBottom : heightPercentage(4) }}>인기메뉴</Text>
        )}
        
        <View style={styles.hashtagContainer}>
        {Array.isArray(item.hashtagList) && item.hashtagList.map((tag, idx) => (
          <Text key={idx} style={styles.hashtag}>{tag}</Text>
        ))}

        </View>
      </View>
      {/* 책갈피 아이콘 */}
      <TouchableOpacity
        onPress={() => {
          if (bookmarkIds.has(item.id)) {
            handleBookmarkToggle(item.id); // ✅ 북마크 해제
          } else {
            handleTabPress("bookmark", item); // 북마크 추가
          }
        }}
      >
        <Image
          source={
            bookmarkIds.has(item.id)
              ? require("../assets/drawable/bookmark_checked.png")
              : require("../assets/drawable/bookmark.png")
          }
          style={styles.bookmarkImage}
        />
      </TouchableOpacity>


    </View>
    </TouchableOpacity>
      {section.title === "나의 칵테일 바" && index === section.data.length - 1 && originalMyBarsLength >= 2 &&(
        <TouchableOpacity style={styles.toggleButton} onPress={toggleShowMyBars}>
          <Image
            source={
            isExpanded
            ? require("../assets/drawable/collapse.png") // 접기 이미지
            : require("../assets/drawable/expand.png")   // 더보기 이미지
            }
            style={styles.toggleImage}
          />
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
        keyExtractor={(item, index) => item?.id?.toString?.() ?? index.toString()}
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
  toggleImage: {
  width: widthPercentage(77),
  height: heightPercentage(32),
  resizeMode: "contain",
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
    marginTop: heightPercentage(16),
    marginLeft: widthPercentage(16),
    backgroundColor: "#FFFCF3",
    flexDirection: "row",
    paddingBottom: heightPercentage(12),
  },
  textContainer: {
    marginLeft: widthPercentage(12),
    width: widthPercentage(168),
    height: heightPercentage(48),
  },
  itemImage: {
    width: widthPercentage(126),
    height: heightPercentage(156),
    borderRadius: widthPercentage(8),
  },
  hashtagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: heightPercentage(5),
    width: widthPercentage(197),
    height: getResponsiveHeight(70,85,85,70,65,60),
    maxHeight: heightPercentage(100),
    overflow: "hidden",
  },
  hashtag: {
    backgroundColor: "#F3EFE6",
    color: "#7D7A6F",
    paddingVertical: heightPercentage(5),
    paddingHorizontal: widthPercentage(10),
    borderRadius: widthPercentage(20),
    fontSize: fontPercentage(12),
    textAlign: "center",
    marginRight : widthPercentage(4),
    marginBottom: heightPercentage(5),
    
  },
  itemTitle: {
    fontSize: fontPercentage(18),
    fontWeight: "bold",
    marginBottom: heightPercentage(7),
  },
  itemDistance: {
    fontSize: fontPercentage(14),
    color: "#7D7A6F",
  },
  toggleButton: {
    alignSelf: "center",
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
    marginLeft: widthPercentage(12),
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
