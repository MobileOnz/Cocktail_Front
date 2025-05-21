import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, StatusBar, Image
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import theme from "../assets/styles/theme";
import {
  widthPercentage, heightPercentage, fontPercentage
} from "../assets/styles/FigmaScreen";
import { RootStackParamList } from "../Navigation/Navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import instance from "../tokenRequest/axios_interceptor";

type SearchScreenProps = StackScreenProps<RootStackParamList, "SearchScreen">;

type SearchLog = {
  keyword: string;
  search_type: "NAME" | "MENU";
};

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [recentNameSearches, setRecentNameSearches] = useState<SearchLog[]>([]);
  const [recentMenuSearches, setRecentMenuSearches] = useState<SearchLog[]>([]);

  const {initialKeyword} = route.params || {};

  //맞춤 추천에서 가져온 키워드가 있는지 확인 후 있다면 바로 Maps로 검색 로직 수행
  useEffect(() => {
    if (initialKeyword){
      
      setSearchText(initialKeyword);
      navigation.navigate("BottomTabNavigator", {
        screen: "지도",
        params: {
          searchCompleted: true,
          searchQuery: initialKeyword,
        },
      });
    }
  }, [initialKeyword]);

  // 🔹 최근 검색어 불러오기
  useEffect(() => {
    const fetchRecentSearches = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        console.log("🔥 accessToken from AsyncStorage:", accessToken);
        if (!accessToken) {
          console.log("로그인 안된 사용자 - 토큰 없음");
          return;
        }

       const res = await instance.get("/api/search/searchlog", {
              authRequired: true,
            });
        const result = res.data;
        console.log("📥 최근 검색어 요청 결과:", result);
        if (result.code === 1) {
          setRecentNameSearches(result.data.name || []);
          setRecentMenuSearches(result.data.menu || []);
        } else {
          console.log("🔒 로그인 안 된 사용자 - 서버에서 비정상 처리됨");
        }
      } catch (err) {
        console.error("❌ 최근 검색어 불러오기 실패:", err);
      }
    };

    fetchRecentSearches();
  }, []);

  // 🔹 추천 검색어 fetch
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchText.length === 0) {
        setSuggestions([]);
        return;
      }

      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        // const res = await fetch(`${API_BASE_URL}/api/search/suggestions?query=${encodeURIComponent(searchText)}`, {
        //   method: "GET",
        //   headers: {
        //     Authorization: accessToken ? `Bearer ${accessToken}` : '',
        //   },
        // });

        const headers: Record<string, string> = {};

       const res = await instance.get("/api/search/suggestions", {
          params: { query: searchText },
          authOptional: true,
        });
        const result = res.data;
        if (result.code === 1 && Array.isArray(result.data)) {
          setSuggestions(result.data);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("❌ 추천 검색어 불러오기 실패:", err);
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [searchText]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      {/* 🔹 검색 입력 영역 */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require("../assets/search/backspace.png")}
            style={{ width: widthPercentage(24), height: heightPercentage(24) }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TextInput
          style={[styles.searchInput, { backgroundColor: "#F3EFE6" }]}
          placeholder="가게 또는 메뉴 명을 입력해주세요."
          placeholderTextColor="#B9B6AD"
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="done"
          onSubmitEditing={() => {
            if (searchText.length > 0) {
              navigation.navigate("BottomTabNavigator", {
                screen: "지도",
                params: {
                  searchCompleted: true,
                  searchQuery: searchText,
                },
              });
            }
          }}
        />

        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchText('')}
            style={styles.clearButton}
          >
            <Image
              source={require("../assets/search/delete.png")}
              style={styles.clearButton}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 🔹 추천 검색어 & 최근 검색어 */}
      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background }]}>
        {searchText.length > 0 && suggestions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>추천 검색어</Text>
            {suggestions.map((keyword, index) => (
              <TouchableOpacity
                key={index}
                style={styles.keywordButton}
                onPress={() => navigation.navigate("BottomTabNavigator", {
                  screen: "지도",
                  params: {
                    searchCompleted: true,
                    searchQuery: keyword,
                  },
                })
              }
              >
                <Text style={styles.keywordText}>{keyword}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {(searchText.length === 0 || initialKeyword) && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24, fontSize: 18 }]}>최근 검색어</Text>
              {[...recentNameSearches, ...recentMenuSearches].map((item, index) => {
                const iconSource =
                  item.search_type === "NAME"
                    ? require("../assets/drawable/search_location_icon.png")
                    : require("../assets/drawable/search_menu_icon.png");

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.recentItem}
                    onPress={() => {
                      if (item.keyword?.length > 0) {
                        navigation.navigate("BottomTabNavigator", {
                          screen: "지도",
                          params: {
                            searchCompleted: true,
                            searchQuery: item.keyword,
                          },
                        });
                      }
                    }}
                  >
                    <View style={styles.recentRow}>
                      <Image
                        source={iconSource}
                        style={styles.recentIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.recentText}>{item.keyword}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

          </>
        )}
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
  header: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: widthPercentage(16),
    paddingVertical: heightPercentage(10),
    backgroundColor: "#f0f0f0",
  },
  clearButton: {
    right: widthPercentage(9),
    top: heightPercentage(38),
    position: 'absolute',
    width: widthPercentage(18),
    height: heightPercentage(18),
  },
  backButton: {
    width: widthPercentage(24),
    height: widthPercentage(24),
    marginTop: heightPercentage(40),
    marginRight: widthPercentage(15),
  },
  searchInput: {
    marginRight: widthPercentage(30),
    paddingHorizontal: heightPercentage(12),
    backgroundColor: "#F3EFE6",
    borderRadius: 8,
    width: widthPercentage(309),
    height: heightPercentage(48),
    marginTop: heightPercentage(49),
    lineHeight: fontPercentage(22),     // 150%
    letterSpacing: fontPercentage(16) * 0.0057,
    fontSize: fontPercentage(16),
    textAlignVertical: "center",
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
    height: heightPercentage(48),
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  recentIcon: {
    width: widthPercentage(24),
    height: widthPercentage(24),
    marginRight: widthPercentage(12),
  },
  recentText: {
    fontSize: fontPercentage(16),
    color: "#2d2d2d",
    fontFamily: 'pretendard-Medium',
  },
});
