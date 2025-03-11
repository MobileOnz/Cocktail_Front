import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet,Image } from "react-native";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../Navigation/Navigation";
const MAIN_CONCEPTS = [
  "혼술하기 좋은", "데이트하기 좋은", "모임하기 좋은",
  "핫 플레이스", "뷰가가 좋은", "컨셉 & 테마",
  "재즈 & 라이브 뮤직", "클래식한"
];

const SUB_CONCEPTS = [
  "조용한", "교류가 많은", "사진 맛집",
  "1차로 가기 좋은", "2차로 가기 좋은",
  "루프탑", "주차장", "교통이 편리한"
];


type NavigationProps = StackNavigationProp<RootStackParamList, "CreateNewListScreen">;


const ICONS = ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣"];

const CreateNewListScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  
  const [selectedMain, setSelectedMain] = useState(null);
  const [selectedSub, setSelectedSub] = useState([]);
  const [screenState, setScreenState] = useState(1); // 1: 첫 번째 화면, 2: 두 번째 화면

  // 태그 추가 & 삭제 핸들러
  const handleSelectMain = (concept) => {
    if (selectedMain === concept) {
      setSelectedMain(null);
    } else {
      setSelectedMain(concept);
    }
  };

  const handleSelectSub = (concept) => {
    if (selectedSub.includes(concept)) {
      setSelectedSub(selectedSub.filter((item) => item !== concept));
    } else if (selectedSub.length < 3) {
      setSelectedSub([...selectedSub, concept]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>새 리스트 만들기</Text>
      <Text onPress={() => navigation.goBack()}>X</Text>

      {/* 선택된 태그 UI (두 번째 화면에서 표시) */}
      {screenState === 2 && (
      <View style={styles.selectedTags}>
        {/* 선택된 태그가 없을 때 기본 텍스트 표시 */}
        {!selectedMain && selectedSub.length === 0 ? (
          <Text style={styles.tagText}>이 리스트의 컨셉을 선택해 주세요</Text>
        ) : (
          <>
            {/* 선택된 메인 태그 */}
            {selectedMain && (
              <TouchableOpacity onPress={() => setSelectedMain(null)} style={styles.selectedMainTag}>
                <Text style={styles.selectedMainTagText}>{selectedMain} ✖</Text>
              </TouchableOpacity>
            )}

            {/* 선택된 서브 태그 */}
            {selectedSub.map((tag, index) => (
              <TouchableOpacity key={index} onPress={() => handleSelectSub(tag)} style={styles.selectedSubTag}>
                <Text style={styles.selectedSubTagText}>{tag} ✖</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
    )}
      {/* 메인 컨셉 선택 */}
      <View style={styles.titleContainer}>
      <Text style={styles.sectionTitle}>메인 컨셉</Text>
      <Text style={styles.sectionSubTitle}> 1가지 선택 가능합니다.</Text>
      </View>
      
      <FlatList
        data={MAIN_CONCEPTS}
        numColumns={3}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectMain(item)}
            style={[
              styles.conceptButton,
              selectedMain === item && styles.selectedButton
            ]}
          >
            <Text style={[styles.conceptText, selectedMain === item && styles.selectedText]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* 컨셉 아이콘 */}
      <Text style={[styles.sectionTitle, styles.titleContainer]}>컨셉 아이콘</Text>
      <View style={styles.iconContainer}>
        {ICONS.map((icon, index) => (
          <Text key={index} style={styles.icon}>{icon}</Text>
        ))}
      </View>
        <View style={styles.line}/>
      {/* 보조 컨셉 선택 */}
      <View style={styles.titleContainer}>
      <Text style={styles.sectionTitle}>보조 컨셉</Text>
      <Text style={styles.sectionSubTitle}> 3가지 선택 가능합니다.</Text>
      </View>
      <View style={styles.titleContainer}>
              <Image source={require("../assets/drawable/feel.png")}
              style={{
                width: widthPercentage(13.33),
                height: heightPercentage(13.33),
              }}
              />
              <Text 
              style = {{
                fontSize : fontPercentage(14),
                fontWeight : "700",
                marginLeft : widthPercentage(4),

              }}
              >분위기</Text>
            </View>
      <FlatList
        data={SUB_CONCEPTS.slice(0,5)}
        numColumns={3}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectSub(item)}
            style={[
              styles.conceptButton,
              selectedSub.includes(item) && styles.selectedSubButton
            ]}
          >
            <Text style={[styles.conceptText, selectedSub.includes(item)]}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.titleContainer}>
              <Image source={require("../assets/drawable/location.png")}
              style = {{
                width : widthPercentage(13.33),
                height : heightPercentage(15)

              }}/>
              <Text>위치</Text>
            </View>
      <FlatList
        data={SUB_CONCEPTS.slice(5)}
        numColumns={3}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectSub(item)}
            style={[
              styles.conceptButton,
              selectedSub.includes(item) && styles.selectedSubButton
            ]}
          >
            
            <Text style={[styles.conceptText, selectedSub.includes(item)]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* 저장 버튼 */}
      <TouchableOpacity
        style={[styles.saveButton, (selectedMain || selectedSub.length > 0) && styles.activeSaveButton]}
        onPress={() => setScreenState(2)}
        disabled={!selectedMain && selectedSub.length === 0}
      >
        <Text style={[styles.saveButtonText, (selectedMain || selectedSub.length > 0) && styles.activeSaveButtonText]}>
          저장하기
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateNewListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFCF3",
  },
  tagText : {
    fontWeight : "500",
    fontSize : fontPercentage(16),
    color : "#B9B6AD",
    marginLeft : widthPercentage(12),
    marginTop : heightPercentage(20)
  },
  titleContainer : {
    flexDirection : "row",
    textAlign : "left",
    marginTop : heightPercentage(12),
    marginLeft : widthPercentage(16),
    marginBottom : heightPercentage(8)
  },
  header: {
    fontSize: 18,
    fontWeight: "700",
    marginTop : heightPercentage(30),
    textAlign: "center",
    justifyContent : "center",
  },
  sectionTitle: {
    marginTop : heightPercentage(16),
    fontSize: fontPercentage(16),
    fontWeight: "700",
  },
  sectionSubTitle: {
    fontSize: fontPercentage(14),
    fontWeight: "500",
    color : "#7D7A6F",
    marginTop : heightPercentage(18),
  },
  line : {
    height : heightPercentage(8),
    backgroundColor : "#F3EFE6"
  },
  conceptButton: {
    paddingHorizontal : 12,
    paddingVertical : 8,
    margin: 5,
    backgroundColor: "#F3EFE6",
    borderRadius: 20,
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#21103C",
    color : "FFF"
  },
  selectedSubButton: {
    backgroundColor: "#D0CEDD",
  },
  conceptText: {
    fontSize: fontPercentage(14),
    fontWeight : "500",
    color: "#2D2D2D",
  },
  selectedText: {
    color: "#FFF",
    fontSize : fontPercentage(14),
    fontWeight : "500",
  },
  iconContainer: {
    flexDirection: "row",
    marginVertical: 10,
    width : widthPercentage(24),
    height : heightPercentage(24),
  },
  icon: {
    fontSize: 24,
    marginHorizontal: 5,
  },
  selectedTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  selectedMainTag: {
    backgroundColor: "#21103C",
    padding: 8,
    borderRadius: 20,
    margin: 5,
  },
  selectedSubTag: {
    backgroundColor: "#D0CEDD",
    padding: 8,
    borderRadius: 20,
    margin: 5,
  },
  selectedMainTagText: {
    color: "#FFFFFF",
    fontSize: fontPercentage(14),
  },
  selectedSubTagText: {
    color: "#21103C",
    fontSize: fontPercentage(14),
  },
  saveButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#DDD",
  },
  activeSaveButton: {
    backgroundColor: "#21103C",
  },
  saveButtonText: {
    fontSize: 16,
    color: "#999",
  },
  activeSaveButtonText: {
    color: "#FFF",
  },
  
});
