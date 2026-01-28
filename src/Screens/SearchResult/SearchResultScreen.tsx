import { StyleSheet, Text, View } from 'react-native';
import React, { useRef } from 'react';
import { FlatList, Pressable, ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { ActivityIndicator, Button } from 'react-native-paper';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import theme from '../../assets/styles/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/Navigation';
import CocktailCard from '../../Components/CocktailCard';
import useSearchResultViewModel from './SearchResultViewModel';
import OpenBottomSheet, { OpenBottomSheetHandle } from '../../Components/BottomSheet/OpenBottomSheet';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FIcon from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterBottomSheet, { FilterBottomSheetRef } from '../../Components/BottomSheet/FilterBottomSheet/FilterBottomSheet';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchResultScreen'>;


const SearchResultScreen = ({ navigation, route }: Props) => {
  const { keyword } = route.params;
  const bottomSheetRef = useRef<OpenBottomSheetHandle>(null);
  const filterRef = useRef<FilterBottomSheetRef>(null);
  const vm = useSearchResultViewModel(keyword);


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
        contentContainerStyle={styles.listContent}

        ListHeaderComponent={
          <View>
            {/* 상단 검색바 */}
            <View style={styles.searchContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('BottomTabNavigator', {
                screen: '홈',
              })}>
                <FIcon name="chevron-left" size={24} color="#000" style={{ marginRight: widthPercentage(14) }} />
              </TouchableOpacity>

              <View style={styles.search}>
                <MIcon name="magnify" size={24} color="#BDBDBD" />
                <Text style={styles.searchText}>{keyword}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <FIcon name="x" size={30} color="#000" style={{ marginLeft: widthPercentage(14) }} />
              </TouchableOpacity>
            </View>

            {/* 필터 뷰 */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterView}
            >
              {['최신순', '도수', '스타일', '맛', '베이스'].map((label, idx) => {
                const filter = vm.appliedFilter;

                const isSelected =
                  (label === '최신순' && filter.sort !== '최신순') ||
                  (label === '도수' && filter.degree) ||
                  (label === '스타일' && filter.style) ||
                  (label === '맛' && filter.taste.length > 0) ||
                  (label === '베이스' && filter.base.length > 0);

                return (
                  <Button
                    key={idx}
                    mode={isSelected ? 'contained' : 'outlined'}
                    icon={label === '최신순' ? undefined : 'chevron-down'}
                    compact
                    contentStyle={[styles.filterButtonContent, { height: 'auto', paddingVertical: 4 }]}

                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : styles.chipUnselected,
                    ]}

                    labelStyle={[
                      styles.chipLabel,
                      isSelected && styles.chipLabelSelected,
                    ]}
                    onPress={() => bottomSheetRef.current?.open()}
                  >
                    {label}
                  </Button>
                );
              })}
            </ScrollView>
          </View>
        }

        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {vm.loading && <ActivityIndicator size="large" />}
            {!vm.loading && vm.error && (
              <Text style={styles.text}>{vm.error}</Text>
            )}
            {!vm.loading && !vm.error && vm.results?.length === 0 && (
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
              onPress={() => { navigation.navigate('CocktailDetailScreen', { cocktailId: item.id }); }}
            />
          </View>
        )}
      />
      <OpenBottomSheet
        ref={bottomSheetRef}
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
    backgroundColor: theme.background,
  },
  closeButton: {
    padding: 10,
  },
  searchText: {
    fontFamily: 'Pretendard-Medium',
    marginLeft: 8,
    fontWeight: '500',
    fontSize: fontPercentage(16),
    color: 'black',
  },
  text: {
    color: '#BDBDBD',
    fontFamily: 'Pretendard-Medium',
    fontSize: fontPercentage(16),
    fontWeight: '600',
  },
  searchContainer: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetIcon: {
    marginRight: 4,
    transform: [{ scaleX: -1 }],
  },
  search: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    width: '75%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    height: heightPercentage(48),
  },

  filterView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: widthPercentage(8),
    paddingVertical: 4,
    gap: 8,
  },
  filterButtonContent: {
    // 3. 버튼 내부 레이아웃 설정
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    borderRadius: 100,
    borderWidth: 1,
    // 2. 고정 높이보다는 최소 높이를 지정하거나 패딩으로 조절하세요.
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0, // 버튼 그림자 제거 (필요시)
  },
  chipUnselected: {
    backgroundColor: theme.background,
    borderColor: '#E0E0E0',
  },
  chipSelected: {
    backgroundColor: '#313131',
    borderColor: '#E0E0E0',
  },
  chipLabel: {
    fontFamily: 'Pretendard-Medium',
    fontSize: fontPercentage(14),
    color: '#616161',
    includeFontPadding: false,
    lineHeight: fontPercentage(18),
    textAlignVertical: 'center',
    marginVertical: heightPercentage(4),
    marginHorizontal: widthPercentage(10),
  },
  chipLabelSelected: {
    fontFamily: 'Pretendard-Medium',
    fontSize: fontPercentage(14),
    color: '#FFFFFF',
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
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: '#FFF',
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
    backgroundColor: theme.background,
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
    fontWeight: '500',
  },
  applyText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
