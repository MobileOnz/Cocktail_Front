import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet,Image,ScrollView, SafeAreaView } from "react-native";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../Navigation/Navigation";
import { useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp, useRoute } from "@react-navigation/native";
import instance from "../tokenRequest/axios_interceptor";

interface Tag {
  id: number;
  name: string;
}
type CreateNewListRouteProp = RouteProp<RootStackParamList, "CreateNewListScreen">;

const imageMap = {
  1: require("../assets/newListIcon/Name=Classic_Status=Default.png"),
  2: require("../assets/newListIcon/Name=Light_Status=Default.png"),
  3: require("../assets/newListIcon/Name=Party_Status=Default.png"),
  4: require("../assets/newListIcon/Name=Play_Status=Default.png"),
  5: require("../assets/newListIcon/Name=Shine_Status=Default.png"),
  6: require("../assets/newListIcon/Name=Summer_Status=Default.png"),
};

const clickedImageMap = {
  1: require("../assets/newListIcon/Name=Classic_Status=Active.png"),
  2: require("../assets/newListIcon/Name=Light_Status=Active.png"),
  3: require("../assets/newListIcon/Name=Party_Status=Active.png"),
  4: require("../assets/newListIcon/Name=Play_Status=Active.png"),
  5: require("../assets/newListIcon/Name=Shine_Status=Active.png"),
  6: require("../assets/newListIcon/Name=Summer_Status=Active.png"),
};

const CreateNewListScreen = () => {

  const [selectedImageId, setSelectedImageId] = useState<number>(1);
  const route = useRoute<CreateNewListRouteProp>();
  const { editMode, itemId } = route.params ?? {};
  const [mainTags, setMainTags] = useState<Tag[]>([]);
  const [moodTags, setMoodTags] = useState<Tag[]>([]);
  const [locationTags, setLocationTags] = useState<Tag[]>([]);

//저장요청 함수 추가하기 
const handleSaveList = async () => {
  const token = await AsyncStorage.getItem("accessToken");
  if (!token) {
    console.warn("토큰 없음");
    return;
  }

  const mainTagId = mainTags.find((tag) => tag.name === selectedMain)?.id;
  const subTagIds = [...moodTags, ...locationTags]
    .filter((tag) => selectedSub.includes(tag.name))
    .map((tag) => tag.id);

  const payload = {
    iconTagId: selectedImageId,
    mainTagId,
    subTagIds,
  };
  const patchPayload = {
    id : itemId,
    iconTagId: selectedImageId,
    mainTagId,
    subTagIds,
  };

  try {
    if (editMode && itemId) {
      // 수정 요청 (PATCH)
      const response = await instance.patch(`/api/list`, patchPayload);
      console.log("리스트 수정 성공:", response.data);
    } else {
      // 생성 요청 (POST)
      const response = await instance.post(`/api/list`, payload);
      console.log("리스트 저장 성공:", response.data);
    }
    navigation.goBack();
  }catch (error) {
    if (error.message === '리프레시 토큰 만료') {
     navigation.navigate("Login" as never);
    }
  }
};


   useEffect(() => {

    const fetchTags = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      console.log("✅ 토큰:", token);
      if (!token) return;
  
      const tagResponse = await axios.get(`${API_BASE_URL}/api/list`, {
        headers: { Authorization: `${token}` },
      });
         
  
      const { main_tags, sub_tags, img_tags } = tagResponse.data.data;
      setMainTags(main_tags);
      setMoodTags(sub_tags.MOOD || []);
      setLocationTags(sub_tags.LOCATION || []);
  
  
      if (editMode && itemId) {
        const listResponse = await axios.get(`${API_BASE_URL}/api/list/${itemId}`, {
          headers: { Authorization: `${token}` },
        });
       
        const listData = listResponse.data.data;
       
        setSelectedMain(listData.main_tag.name);
        setSelectedSub(
          Object.values(listData.sub_tags)
            .flat()
            .map((tag: any) => tag.name)
        );
        setSelectedImageId(
          typeof listData.icon_tag === "number" && imageMap[listData.icon_tag]
            ? listData.icon_tag
            : 1 // 기본값
        );
      }
      
    };
    
  
    fetchTags();
  }, []);
  

//서버 기반 태그 맞추기
 
  const navigation = useNavigation<RootStackParamList>();
  
  const [selectedMain, setSelectedMain] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string[]>([]);

  const handleSelectMain = (conceptName: string) => {
    setSelectedMain(prev => prev === conceptName ? null : conceptName);
  };
  
  const handleSelectSub = (conceptName: string) => {
    if (selectedSub.includes(conceptName)) {
      setSelectedSub(prev => prev.filter(item => item !== conceptName));
    } else if (selectedSub.length < 3) {
      setSelectedSub(prev => [...prev, conceptName]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
	  {/* 맨 위 헤더 데이터  */}
      <View style={styles.headerContainer}>
  <Text style={styles.headerTitle}>새 리스트 만들기</Text>
  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
    <Image source={require("../assets/drawable/close.png")} style={{width: widthPercentage(18), height: heightPercentage(18)}}/>
  </TouchableOpacity>
</View>

      {/* 선택된 태그 UI (두 번째 화면에서 표시) */}
	  <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

      <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{ paddingHorizontal: widthPercentage(16) }}
  style={{ marginTop: heightPercentage(12) }}
>
  {/* 선택된 태그가 없을 때 기본 텍스트 표시 */}
  {!selectedMain && selectedSub.length === 0 ? (
    <Text style={styles.tagText}>이 리스트의 컨셉을 선택해 주세요</Text>
  ) : (
    <View style={{ flexDirection: "row" }}>
      {/* 선택된 메인 태그 */}
      {selectedMain && (
        <TouchableOpacity onPress={() => setSelectedMain(null)} style={styles.selectedMainTag}>
          <Text style={styles.selectedMainTagText}>{selectedMain} X</Text>
        </TouchableOpacity>
      )}

      {/* 선택된 서브 태그 */}
      {selectedSub.map((tag, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleSelectSub(tag)}
          style={styles.selectedSubTag}
        >
          <Text style={styles.selectedSubTagText}>{tag} X</Text>
        </TouchableOpacity>
      ))}
    </View>
  )}
</ScrollView>
    
      {/* 메인 컨셉 선택 */}
      <View style={styles.titleContainer}>
      <Text style={styles.sectionTitle}>메인 컨셉</Text>
      <Text style={styles.sectionSubTitle}> 1가지 선택 가능합니다.</Text>
      </View>
      
      <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: widthPercentage(16) }}>
  {mainTags.map((item) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handleSelectMain(item.name)}
      style={[
        styles.conceptButton,
        selectedMain === item.name && styles.selectedButton
      ]}
    >
      <Text style={[
        styles.conceptText,
        selectedMain === item.name && styles.selectedMainText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  ))}
</View>


      {/* 컨셉 아이콘 */}
      <Text style={[styles.sectionTitle, styles.titleContainer]}>컨셉 아이콘</Text>
      <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  style={{ padding : 10 }}
  >
  {Object.keys(imageMap).map((idStr) => {
    const id = Number(idStr);
    const isSelected = selectedImageId === id;

    return (
      <TouchableOpacity key={id} onPress={() => setSelectedImageId(id)}>
        <Image
          source={isSelected ? clickedImageMap[id] : imageMap[id]}
          style={{
            
            width: isSelected ? widthPercentage(32) : widthPercentage(24),
            height: isSelected ? widthPercentage(32) : widthPercentage(24),
            marginTop: isSelected ? -heightPercentage(4) : 0,
            marginRight: widthPercentage(32),
            resizeMode: "contain",
          }}
        />
      </TouchableOpacity>
    );
  })}
</ScrollView>        

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
  <Text style={{
    fontSize: fontPercentage(14),
    fontWeight: "700",
    marginLeft: widthPercentage(4),
  }}>분위기</Text>
</View>

<View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: widthPercentage(16) }}>
  {moodTags.map((item) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handleSelectSub(item.name)}
      style={[
        styles.conceptButton,
        selectedSub.includes(item.name) && styles.selectedSubButton
      ]}
    >
      <Text style={[
        styles.conceptText,
        selectedSub.includes(item.name) && styles.selectedText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  ))}
</View>


<View style={styles.titleContainer}>
  <Image source={require("../assets/drawable/site.png")}
    style={{
      width: widthPercentage(18),
      height: heightPercentage(18),
    }}
  />
  <Text style={{
    fontSize: fontPercentage(14),
    fontWeight: "700",
    marginLeft: widthPercentage(4),
  }}>
    위치
  </Text>
</View>
<View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: widthPercentage(16) }}>
  {locationTags.map((item) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handleSelectSub(item.name)}
      style={[
        styles.conceptButton,
        selectedSub.includes(item.name) && styles.selectedSubButton
      ]}
    >
      <Text style={[
        styles.conceptText,
        selectedSub.includes(item.name) && styles.selectedText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  ))}
</View>

</ScrollView>
</View>

      {/* 저장 버튼 */}
      <TouchableOpacity
        style={[styles.saveButton, (selectedMain && selectedSub.length > 0) && styles.activeSaveButton]}
		  onPress={handleSaveList}
        disabled={!selectedMain && selectedSub.length === 0}
      >
        <Text style={[styles.saveButtonText, (selectedMain || selectedSub.length > 0) && styles.activeSaveButtonText]}>
          저장하기
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CreateNewListScreen;

const styles = StyleSheet.create({
	scrollContent: {
		paddingBottom: heightPercentage(30), 
	  },
  container: {
    flex: 1,
    backgroundColor: "#FFFCF3",
  },
  headerContainer: {
	flexDirection: "row",
	alignItems: "center",
	justifyContent: "center",
	position: "relative",
	marginTop: heightPercentage(24),
	paddingHorizontal: widthPercentage(20),
	height: heightPercentage(40),
  },
  headerTitle: {
	fontSize: fontPercentage(18),
	fontWeight: "700",
	textAlign: "center",
	flex: 1, 
  },
  closeButton: {
	position: "absolute",
	right: widthPercentage(20),
	top: 0,
	bottom: 0,
	justifyContent: "center",
  },
  closeText: {
	fontSize: fontPercentage(24),
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
  headerContext : {
	flexDirection : "row"
  },
  header: {
    fontSize: fontPercentage(20),
    fontWeight: "700",
    marginTop : heightPercentage(30),
 
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
  selectedMainText : {
	color: "#FFF",
    fontSize : fontPercentage(14),
    fontWeight : "500",
  },
  selectedText: {
    color: "#2D2D2D",
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
    marginTop: heightPercentage(20),
    padding: widthPercentage(15),
    borderRadius: widthPercentage(10),
    alignItems: "center",
    backgroundColor: "#DDD",
    marginBottom: heightPercentage(10),
    marginHorizontal: widthPercentage(10),
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
