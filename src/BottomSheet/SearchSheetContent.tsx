import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { BottomSheetSectionList } from "@gorhom/bottom-sheet";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../Navigation/Navigation";
import { StackScreenProps } from "@react-navigation/stack";
type SearchScreenProps = StackScreenProps<RootStackParamList, "SearchScreen">;


type myBarList = {
  listId: number;
  title: string;
  barAdress: string;
  image: any;
  hashtageList: string[];
};

type Section = {
  title: string;
  data: myBarList[];
};

interface SearchSheetListProps {
  sections: Section[];
  showMyBars: boolean;
  setShowMyBars: (value: boolean) => void;
}

const MainBottomSheet: React.FC<SearchSheetListProps> = ({ sections, showMyBars, setShowMyBars }) => {
  const navigation = useNavigation();
  const renderBarItem = ({ item, index, section }: { item: myBarList; index: number; section: any }) => (
    <>
      <TouchableOpacity  onPress={() => navigation.navigate("MarketDetail"as never)} 
      style={styles.itemContainer}>
        <Image style={styles.itemImage} source={item.image} />
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDistance}>{item.barAdress}</Text>
          <Text style={{ color: "#B9B6AD", fontSize: fontPercentage(12) }}>인기메뉴</Text>
          <View style={styles.hashtagContainer}>
            {item.hashtageList.map((tag, idx) => (
              <Text key={idx} style={styles.hashtag}>
                {tag}
              </Text>
            ))}
          </View>
        </View>
      </TouchableOpacity>

      {section.title === "나의 칵테일 바" && index === section.data.length - 1 && (
        <TouchableOpacity style={styles.toggleButton} onPress={() => setShowMyBars(!showMyBars)}>
          <Text style={styles.toggleText}>{showMyBars ? "접기" : "더보기"}</Text>
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
      sections={sections}
      keyExtractor={(item) => item.listId.toString()}
      renderItem={renderBarItem}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled={false}
      ListFooterComponent={() =>
        showMyBars && (
          <TouchableOpacity style={styles.toggleButton} onPress={() => setShowMyBars(false)}>
            <Text style={styles.toggleText}>접기</Text>
          </TouchableOpacity>
        )
      }
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
});

export default MainBottomSheet;
