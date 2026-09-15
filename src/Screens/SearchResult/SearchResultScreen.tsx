import { Image, Platform, StyleSheet, Text, View, FlatList } from 'react-native';
import React, { useCallback, useRef } from 'react';
import { Pressable, TouchableOpacity } from 'react-native-gesture-handler';
import { ActivityIndicator } from 'react-native-paper';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import { colors } from '../../lib/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/Navigation';
import CocktailCard from '../../Components/CocktailCard';
import useSearchResultViewModel from './SearchResultViewModel';
import OpenBottomSheet, { OpenBottomSheetHandle } from '../../Components/BottomSheet/OpenBottomSheet';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import EIcon from 'react-native-vector-icons/EvilIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterBottomSheet, { FilterBottomSheetRef } from '../../Components/BottomSheet/FilterBottomSheet/FilterBottomSheet';
import { DEFAULT_FILTER } from '../../Components/BottomSheet/FilterBottomSheet/FilterBottomSheetViewModel';
import FilterTriggerRow from '../../Components/Filter/FilterTriggerRow';
import Icon from 'react-native-vector-icons/Ionicons';
type Props = NativeStackScreenProps<RootStackParamList, 'SearchResultScreen'>;


const SearchResultScreen = ({ navigation, route }: Props) => {
  const { keyword } = route.params;
  const bottomSheetRef = useRef<OpenBottomSheetHandle>(null);
  const filterRef = useRef<FilterBottomSheetRef>(null);
  const vm = useSearchResultViewModel(keyword);

  const { refetch } = vm;

  // 목록과 시트를 같이 되돌린다 — 시트 상태만 남으면 다시 열었을 때 해제한 조건이 선택돼 보인다.
  const handleResetFilter = useCallback(() => {
    filterRef.current?.reset();
    refetch(DEFAULT_FILTER);
  }, [refetch]);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <FlatList
        data={vm.loading || vm.error ? [] : vm.results}
        style={{ flex: 1 }}
        extraData={vm.appliedFilter}
        numColumns={2}
        columnWrapperStyle={styles.row}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { flexGrow: 1 }]}
        ListHeaderComponent={
          <View>
            {/* 상단 검색바 */}
            <View style={styles.searchContainer}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="chevron-back-sharp" size={24} color="#000" style={{ marginRight: widthPercentage(8) }} />
              </TouchableOpacity>

              {/* 검색어 칸이 View 라 아예 누를 수 없었다 — 검색 결과에서 검색어를 고치려면
                  뒤로 갔다가 다시 들어와야 했다(QA: "검색 후 검색창 클릭이 안 됩니다").
                  누르면 기존 검색어를 채운 채로 검색 화면에 돌아간다. */}
              <TouchableOpacity
                style={styles.search}
                activeOpacity={0.7}
                accessibilityRole="search"
                accessibilityLabel={`검색어 ${keyword}, 다시 검색하기`}
                onPress={() => navigation.navigate('SearchScreen', { initialKeyword: keyword })}>
                <Image
                  source={require('../../assets/drawable/SharpSearch.png')}
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: '#D9D9D9',
                  }}
                  resizeMode="contain"
                />
                <Text style={styles.searchText}>{keyword}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('BottomTabNavigator', {
                screen: '레시피북',
              })}>
                <EIcon name="close" size={24} color="#000" style={{ marginLeft: widthPercentage(14) }} />
              </TouchableOpacity>
            </View>

            {/* 필터 진입점 — 조건별 칩이 전부 같은 시트를 열던 것을 하나로 합쳤다. */}
            <FilterTriggerRow
              filter={vm.appliedFilter}
              onPress={() => bottomSheetRef.current?.open()}
              onReset={handleResetFilter}
              style={styles.filterRow}
            />
          </View>
        }

        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {vm.loading && <ActivityIndicator size="large" />}
            {!vm.loading && vm.error && (
              <Text style={styles.text}>{vm.error}</Text>
            )}
            {!vm.loading && !vm.error && vm.results?.length === 0 && (
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.text}>아직 준비된 칵테일이 없네요.</Text>
                <Text style={styles.text}>다른 키워드로 다시 검색해보시겠어요?</Text>
              </View>
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
              bookmarked={item.isBookmarked}
              onPress={() => { navigation.navigate('CocktailDetailScreen', { cocktailId: item.id }); }}
              onToggleBookmark={() => vm.bookmarked(item.id)}
            />
          </View>
        )}
      />
      <OpenBottomSheet
        ref={bottomSheetRef}
        // 적용 없이 닫으면 시트 선택과 목록이 어긋난다 → 닫힐 때 적용된 필터로 되돌린다.
        onIndexChange={index => {
          if (index === -1) {
            filterRef.current?.reset();
          }
        }}
        footer={
          <View style={styles.footer}>
            <Pressable style={[styles.resetButton]} onPress={() => { filterRef.current?.reset(); }} >
              <MIcon name="refresh" size={20} color="#444" style={styles.resetIcon} />
              <Text style={styles.resetText}>초기화</Text>
            </Pressable>

            <Pressable style={styles.applyButton} onPress={() => {
              filterRef.current?.apply();
              bottomSheetRef.current?.close?.();
            }
            }>
              <Text style={styles.applyText}>적용하기</Text>
            </Pressable>
          </View>
        }
      >

        <FilterBottomSheet
          ref={filterRef}
          initialValue={vm.appliedFilter}
          onApply={(filterValue) => vm.refetch(filterValue)}
          onClose={() => bottomSheetRef.current?.close()}
        />
      </OpenBottomSheet>
    </SafeAreaView>
  );
};

export default SearchResultScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  closeButton: {
    padding: 10,
  },
  searchText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: fontPercentage(16),
    color: '#000',
    marginLeft: 8,
  },
  text: {
    color: '#BDBDBD',
    fontFamily: 'Pretendard-Regular',
    fontSize: fontPercentage(16), textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: widthPercentage(16),
    flexDirection: 'row',
    alignItems: 'center',
    // SafeAreaView edges={['top']} 가 이미 상태바를 비켜준다.
    // 여기 있던 marginTop: 50 은 그 위에 또 얹혀서 검색바를 과하게 밀어내렸다.
    marginTop: heightPercentage(8),
    paddingBottom: heightPercentage(10),
  },
  resetIcon: {
    marginRight: 4,

  },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    height: heightPercentage(42),
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'flex-start',
  },

  filterRow: {
    paddingHorizontal: widthPercentage(8),
    paddingTop: 4,
    paddingBottom: heightPercentage(16),
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: widthPercentage(16),
    marginBottom: 16,
    gap: 15,
  },
  cardWrapper: {
    width: widthPercentage(160),
    alignItems: 'center',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.bg,


    borderTopWidth: 1,
    borderTopColor: '#FFFFFF',


    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {

        elevation: 5,
      },
    }),
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    height: heightPercentage(50),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  applyButton: {
    flex: 2,
    height: heightPercentage(50),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#313131',
  },
  resetText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    color: '#444444',
  },
  applyText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
