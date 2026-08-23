import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Text,
  FlatList,
  Image,
  TextInput,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, fontSize, radius, spacing } from '../../lib/theme';
import {
  widthPercentage,
  heightPercentage,
  fontPercentage,
} from '../../assets/styles/FigmaScreen';
import { RootStackParamList } from '../../Navigation/Navigation';
import { useSearchViewModel } from '../Search/SearchViewModel';
import EmptyState from '../../Components/common/EmptyState';
import FIcon from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/Ionicons';

type SearchScreenProps = StackScreenProps<RootStackParamList, 'SearchScreen'>;

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation, route }) => {
  const { initialKeyword } = route.params || {};
  // 예전엔 marginTop: heightPercentage(50) 으로 상태바를 눈대중했는데,
  // Dynamic Island 기기의 실제 인셋(59~62pt)보다 작아서 헤더가 상태바에 물렸다.
  const insets = useSafeAreaInsets();

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
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      {/* 상단 검색 바 영역 */}
      <View style={[styles.header, { paddingTop: insets.top + heightPercentage(8) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-back-sharp" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* 레시피북 헤더의 검색 버튼과 같은 계열(회색 필)로 맞춘다. paper 의 outlined 룩은 이 앱 어디에도 없었다. */}
        <View style={styles.searchField}>
          <Image
            source={require('../../assets/drawable/SharpSearch.png')}
            style={styles.searchFieldIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="칵테일을 검색해보세요"
            placeholderTextColor={colors.textDisabled}
            value={searchText}
            onChangeText={handleSearchTextChange}
            onSubmitEditing={handleSubmitSearch}
            returnKeyType="search"
            autoFocus
            autoCorrect={false}
            accessibilityLabel="칵테일 검색어 입력"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={handleClearText}
              accessibilityRole="button"
              accessibilityLabel="검색어 지우기"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close-circle" size={18} color={colors.textDisabled} />
            </TouchableOpacity>
          )}
        </View>
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
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <EmptyState
                title="최근 검색어가 없어요"
                description="칵테일 이름이나 재료로 검색해보세요."
                emoji="🔍"
                compact
              />
            }
            renderItem={({ item }) => (
              <View style={styles.recentItem}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => handleRecentSearchPress(item.queryText)}
                >
                  <Text style={styles.recentText}>{item.queryText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeRecentSearch(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.queryText} 검색 기록 삭제`}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <FIcon name="x" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      {/* 검색어 입력 중: 자동완성 추천 목록 */}
      {searchText.length > 0 && (
        <View style={styles.content}>
          {suggestions.length === 0 && (
            <EmptyState
              title="일치하는 칵테일이 없어요"
              description="다른 키워드로 검색해보시겠어요?"
              emoji="🔍"
              compact
            />
          )}
          {suggestions.map((item, index) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => navigateToMap(item.name)}
              key={index}
            >
              <Image
                source={require('../../assets/drawable/SharpSearch.png')}
                style={styles.suggestionIcon}
                resizeMode="contain"
              />
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
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: widthPercentage(16),
    paddingBottom: heightPercentage(10),
  },
  backButton: {
    marginRight: spacing.sm,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: spacing.sm,
    height: heightPercentage(42),
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.bgMuted,
  },
  searchFieldIcon: {
    width: widthPercentage(18),
    height: widthPercentage(18),
    tintColor: colors.textTertiary,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.md),
    color: colors.text,
  },
  content: {
    flex: 1,
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
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.xl),
    color: colors.text,
  },
  clearAllText: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.xs),
    color: colors.textTertiary,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: heightPercentage(12),
  },
  recentText: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.md),
    color: colors.textSecondary,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: heightPercentage(12),
  },
  suggestionIcon: {
    width: widthPercentage(20),
    height: widthPercentage(20),
    tintColor: colors.textSecondary,
  },
  suggestionText: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.md),
    color: colors.textSecondary,
    marginLeft: widthPercentage(10),
  },
});
