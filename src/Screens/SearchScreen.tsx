import React, { useState, useEffect } from "react";
import {View,Text,StyleSheet,TouchableOpacity,TextInput,ScrollView,StatusBar,Image
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import theme from "../assets/styles/theme";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import { RootStackParamList } from "../Navigation/Navigation";
import { API_BASE_URL } from "@env";

import AsyncStorage from "@react-native-async-storage/async-storage";
type SearchScreenProps = StackScreenProps<RootStackParamList, "SearchScreen">;

const recommendedKeywords = ["추천 검색어1", "추천 검색어2", "추천 검색어3", "추천 검색어4"];
const recentSearches = ["검색어 1", "검색어 2"];



const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const handlePress = () => {
    navigation.navigate("Maps", { searchCompleted: true });
  };

  type SearchLog = {
    keyword: string;
    search_type: "NAME" | "MENU";
  };

  //최근 검색어
  const [recentNameSearches, setRecentNameSearches] = useState<SearchLog[]>([]);
  const [recentMenuSearches, setRecentMenuSearches] = useState<SearchLog[]>([]);
  useEffect(() => {
    const fetchRecentSearches = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if(!accessToken){
          console.log("로그인 안된 사용자 - 토큰 없음");
          return;
        }
        const res = await fetch(`${API_BASE_URL}/api/search/searchlog`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`, // accessToken을 상황에 맞게 설정
          },
        });
        const result = await res.json();
        console.log("📡 최근 검색어 !! - 서버 응답 전체:", result);
        if (result.code === 1) {
          setRecentNameSearches(result.data.name || []);
          setRecentMenuSearches(result.data.menu || []);
        } else {
          console.log("🔒 로그인 안 된 사용자 - 최근 검색어 비표시");
        }
      } catch (err) {
        console.error("❌ 최근 검색어 불러오기 실패:", err);
      }
    };
  
    fetchRecentSearches();
  }, []);

  return (

    <View style={styles.container}>
      {/* 시스템 영역, 색상 및 아이콘 표시 변경 */}
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("BottomTabNavigator", { screen: "지도" })}
        >
         <Image
         source={require("../assets/search/backspace.png")}
         style={{width : widthPercentage(24), height : heightPercentage(24)}}
         resizeMode="contain"
         />

        </TouchableOpacity>
         {/*검색창 입력*/}
        <TextInput
          style={[styles.searchInput, {backgroundColor : "#F3EFE6"}]}
          placeholder="가게 또는 메뉴 명을 입력해주세요."
          placeholderTextColor="#B9B6AD"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
          returnKeyType="done"
          onSubmitEditing={() => {
            {if(searchText.length >0){
            navigation.navigate("Maps", { searchCompleted: true, searchQuery: searchText});
            }}
          }}
        />
        {/*텍스트 입력 시, 삭제 버튼 */}
         {searchText.length > 0 && (
        <TouchableOpacity onPress={() => setSearchText('')}
        style={styles.clearButton}>
          <Image source={require("../assets/search/delete.png")}
          style = {styles.clearButton}
          resizeMode="contain"/>
        </TouchableOpacity>
      )}
        

      </View>

      

      {/* 스크롤 영역: 추천 검색어와 최근 검색어 목록 */}
      <ScrollView contentContainerStyle={[styles.scrollContent, {backgroundColor :theme.background}]}>
        <Text style={styles.sectionTitle}>추천 검색어</Text>
        {recommendedKeywords.map((keyword, index) => (
          <TouchableOpacity
            key={index}
            style={styles.keywordButton}
            onPress={handlePress}
          >
            <Text style={styles.keywordText}>{keyword}</Text>
          </TouchableOpacity>
        ))}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>최근 검색어</Text>
        {[...recentNameSearches, ...recentMenuSearches].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.recentItem}
            onPress={() => {
              if (item.keyword?.length > 0) {
                navigation.navigate("Maps", { searchCompleted: true, searchQuery: item.keyword });
              }
            }}
          >
            <Text style={styles.recentText}>{item.keyword}</Text>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  // 상단 헤더 영역: 뒤로가기 아이콘과 검색 입력창을 한 줄에 배치
  header: {
    position : "relative",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: widthPercentage(16),
    paddingVertical: heightPercentage(10),
    backgroundColor: "#f0f0f0",
  },
  clearButton: {
    right : widthPercentage(9),
    top : heightPercentage(36),
    position: 'absolute',   
    width : widthPercentage(18),
    height : heightPercentage(18),
  },
  backButton: {
    width : widthPercentage(24),
    height : heightPercentage(24),
    marginTop : heightPercentage(40),
    marginRight: widthPercentage(15),
  },
  searchInput: {
    marginRight : widthPercentage(30),
    paddingHorizontal : heightPercentage(12),
    paddingVertical : widthPercentage(10),
    backgroundColor : "#F3EFE6",
    borderRadius : 8,
    width : widthPercentage(309),
    height : heightPercentage(48),
    marginTop : heightPercentage(49)
  },
  scrollContent: {
    paddingHorizontal: widthPercentage(16),
    paddingVertical: heightPercentage(16),
  },
  sectionTitle: {
    fontSize: fontPercentage(16),
    fontWeight: "bold",
    marginBottom: heightPercentage(8),
  },
  keywordButton: {
    height: heightPercentage(40),
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  keywordText: {
    fontSize: fontPercentage(14),
    color: "#333",
  },
  recentItem: {
    height: heightPercentage(40),
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  recentText: {
    fontSize: fontPercentage(14),
    color: "#555",
  },
});
