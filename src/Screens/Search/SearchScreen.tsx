import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Text,
  FlatList,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import theme from '../../assets/styles/theme';
import {
  widthPercentage,
  heightPercentage,
  fontPercentage,
} from '../../assets/styles/FigmaScreen';
import { RootStackParamList } from '../../Navigation/Navigation';
import { useSearchViewModel } from '../Search/SearchViewModel';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FIcon from 'react-native-vector-icons/Feather';
import { TextInput } from 'react-native-paper';

type SearchScreenProps = StackScreenProps<RootStackParamList, 'SearchScreen'>;

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation, route }) => {
  const { initialKeyword } = route.params || {};

  const {
    searchText,
    handleSearchTextChange,
    handleClearText,
    handleSubmitSearch,
    suggestions,
    handleGoBack,
    navigateToMap,
    recentSearches,
    removeRecentSearch,
    clearAllRecentSearches,
    handleRecentSearchPress,
  } = useSearchViewModel({
    navigation,
    initialKeyword,
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      {/* 상단 검색 바 영역 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <FIcon name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>

        <TextInput
          style={styles.searchInput}
          mode="outlined"
          placeholder="칵테일을 검색해보세요"
          placeholderTextColor="#BCBCBC"
          value={searchText}
          onChangeText={handleSearchTextChange}
          onSubmitEditing={handleSubmitSearch}
          left={<TextInput.Icon icon="magnify" color="#BCBCBC" size={24} />}
          right={
            searchText.length > 0 ? (
              <TextInput.Icon
                icon="close-circle"
                color="#BDBDBD"
                onPress={handleClearText}
              />
            ) : null
          }
          outlineStyle={{ borderRadius: 8, borderWidth: 0 }}
          activeOutlineColor="transparent"
          contentStyle={{ paddingLeft: 0 }}
        />
      </View>


      {/* 검색어 입력 전: 최근 검색어 목록 */}
      {searchText.length === 0 && (
        <View style={styles.content}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>최근 검색어</Text>
            <TouchableOpacity onPress={clearAllRecentSearches}>
              <Text style={styles.clearAllText}>전체 삭제</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={recentSearches}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.recentItem}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => handleRecentSearchPress(item.queryText)}
                >
                  <Text style={styles.recentText}>{item.queryText}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeRecentSearch(item.id)}>
                  <FIcon name="close" size={20} color="#333" />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      {/* 검색어 입력 중: 자동완성 추천 목록 */}
      {searchText.length > 0 && (
        <View style={styles.content}>
          {suggestions.map((item, index) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => navigateToMap(item.name)}
              key={index}
            >
              <MIcon name="magnify" size={20} color="#313131" />
              <Text style={styles.suggestionText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // 화이트 배경
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: widthPercentage(16),
    marginTop: heightPercentage(50), // 상태바 높이 고려
    paddingBottom: heightPercentage(10),
  },
  backButton: {
    marginRight: widthPercentage(8),
  },
  searchInput: {
    flex: 1,
    height: heightPercentage(44),
    backgroundColor: '#F5F5F5', // 연한 회색 배경
    fontSize: fontPercentage(16),
  },
  content: {
    paddingHorizontal: widthPercentage(20),
    marginTop: heightPercentage(20),
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: heightPercentage(20),
  },
  recentTitle: {
    fontSize: fontPercentage(18),
    fontWeight: 'bold',
    color: '#000',
  },
  clearAllText: {
    fontSize: fontPercentage(12),
    color: '#868686',
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: heightPercentage(12),
  },
  recentText: {
    fontSize: fontPercentage(16),
    color: '#616161',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: heightPercentage(12),
  },
  suggestionText: {
    fontSize: fontPercentage(16),
    color: '#616161',
    marginLeft: widthPercentage(10),
  },
});
