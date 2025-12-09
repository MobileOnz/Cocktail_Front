import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { ActivityIndicator, Button, Icon, IconButton } from 'react-native-paper'
import { fontPercentage, widthPercentage } from '../../assets/styles/FigmaScreen'
import theme from '../../assets/styles/theme'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../Navigation/Navigation'
import CocktailCard from '../../Components/CocktailCard'
import useSearchResultViewModel from './SearchResultViewModel'

type Props = NativeStackScreenProps<RootStackParamList, 'SearchResultScreen'>;


const SearchResultScreen = ({ navigation, route }: Props) => {
  const { keyword } = route.params;
  const { results, loading, error } = useSearchResultViewModel(keyword)

  return (
    <View style={styles.container}>
      <FlatList
        data={loading || error ? [] : results}
        style={{ flex: 1 }}
        numColumns={2}
        columnWrapperStyle={styles.row}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}

        ListHeaderComponent={
          <View>
            {/* 상단 검색바 */}
            <View style={styles.searchContainer}>
              <IconButton
                icon="chevron-left"
                size={30}
                onPress={() => navigation.navigate("Home")}
              />
              <View style={styles.search}>
                <Icon source="magnify" size={24} color='#BDBDBD' />
                <Text style={styles.searchText}>{keyword}</Text>
              </View>
              <IconButton icon="close" size={30}
                onPress={() => navigation.goBack()} />
            </View>

            {/* 필터 뷰 */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterView}
            >
              {['최신순', '도수', '스타일', '맛', '베이스'].map((label, idx) => (
                <Button
                  key={idx}
                  mode="outlined"
                  icon={label === '최신순' ? undefined : 'chevron-down'}
                  compact
                  contentStyle={styles.filterButtonContent}
                  style={[styles.chip, styles.chipUnselected]}
                  labelStyle={styles.chipLabel}
                >
                  {label}
                </Button>
              ))}
            </ScrollView>
          </View>
        }

        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading && <ActivityIndicator size="large" />}
            {!loading && error && (
              <Text style={styles.text}>{error}</Text>
            )}
            {!loading && !error && results?.length === 0 && (
              <>
                <Text style={styles.text}>아직 준비된 칵테일이 없네요.</Text>
                <Text style={styles.text}>다른 키워드로 다시 검색해보시겠어요?</Text>
              </>
            )}
          </View>
        }

        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <CocktailCard
              id={item.id}
              name={item.name}
              type={item.type}
              image={item.image}
              onPress={() => { }}
            />
          </View>
        )}
      />
    </View>
  );
};

export default SearchResultScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  searchText: {
    marginLeft: 8,
    fontSize: fontPercentage(24),
    color: 'black',
  },
  text: {
    color: '#BDBDBD',
    fontSize: fontPercentage(16),
    fontWeight: '600',
  },
  searchContainer: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  search: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F3EFE6',
    width: '70%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
  },

  filterView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: widthPercentage(8),
    paddingVertical: 4,
    gap: 8,
  },
  filterButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row-reverse',
    height: 30,
    paddingHorizontal: 10,
  },
  chip: {
    borderRadius: 100,
    borderWidth: 1,
    minHeight: 0,
    marginBottom: 0,
  },
  chipUnselected: {
    backgroundColor: theme.background,
    borderColor: '#E0E0E0',
  },
  chipLabel: {
    fontSize: 10,
    lineHeight: 11,
    color: '#333333',
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  cardWrapper: {
    width: '50%',
    alignItems: 'center',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
});
