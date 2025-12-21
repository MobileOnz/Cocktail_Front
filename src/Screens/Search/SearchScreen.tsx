// src/screens/SearchScreen.tsx
import React from 'react';
import {
  View,

  StyleSheet,
  TouchableOpacity,

  StatusBar,
  Text,

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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TextInput } from 'react-native-paper';
type SearchScreenProps = StackScreenProps<RootStackParamList, 'SearchScreen'>;

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation, route }) => {
  const { initialKeyword } = route.params || {};

  const {
    searchText,
    handleSearchTextChange,
    handleClearText,
    suggestions,
    handleGoBack,
    navigateToMap,
  } = useSearchViewModel({
    navigation,
    initialKeyword,
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      {/* 검색 입력 영역 */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Icon name="chevron-left" size={30} color="#333" />
        </TouchableOpacity>

        <TextInput
          style={styles.searchInput}
          mode="outlined"
          placeholder="칵테일을 검색해보세요."
          value={searchText}
          onChangeText={handleSearchTextChange}
          onSubmitEditing={() => navigateToMap(searchText)}
          left={<TextInput.Icon icon="magnify" />}
          right={
            searchText.length > 0 ? (
              <TextInput.Icon
                icon="close-circle"
                color="#868686"
                onPress={handleClearText}
              />
            ) : null
          }
          activeOutlineColor="transparent"
          outlineColor="#E0DCCE"
        />
      </View>

      {searchText.length > 0 && (

        <View style={{ padding: 16 }}>
          {suggestions.map((item, index) => (
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}
              onPress={() => navigateToMap(item.name)}
              key={index}>
              <Icon name="magnify" size={16} color="##313131" />
              <Text style={{ fontSize: fontPercentage(16), color: '#616161' }}> {item.name}</Text>

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
    backgroundColor: theme.background,
  },
  header: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: widthPercentage(16),
    paddingVertical: heightPercentage(10),
    backgroundColor: '#f0f0f0',
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
    color: '#F3EFE6',
    marginRight: widthPercentage(30),
    paddingHorizontal: heightPercentage(12),
    backgroundColor: '#F3EFE6',
    borderRadius: 8,
    width: '90%',
    height: heightPercentage(48),
    marginTop: heightPercentage(49),
    lineHeight: fontPercentage(22), // 150%
    letterSpacing: fontPercentage(16) * 0.0057,
    fontSize: fontPercentage(16),
    textAlignVertical: 'center',
  },
  scrollContent: {
    paddingHorizontal: widthPercentage(16),
    paddingVertical: heightPercentage(16),
  },
  sectionTitle: {
    fontSize: fontPercentage(16),
    fontWeight: 'bold',
    marginBottom: heightPercentage(8),
  },
  keywordButton: {
    height: heightPercentage(40),
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  keywordText: {
    fontSize: fontPercentage(14),
    color: '#333',
  },
  recentItem: {
    height: heightPercentage(48),
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentIcon: {
    width: widthPercentage(24),
    height: widthPercentage(24),
    marginRight: widthPercentage(12),
  },
  recentText: {
    fontSize: fontPercentage(16),
    color: '#2d2d2d',
    fontFamily: 'pretendard-Medium',
  },
});
