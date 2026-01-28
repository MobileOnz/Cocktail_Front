// AllCocktailScreen.tsx

import React, { useRef } from 'react';
import { StyleSheet, View, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import { FlatList } from 'react-native-gesture-handler';
import theme from '../../assets/styles/theme';
import OpenBottomSheet, { OpenBottomSheetHandle } from '../../Components/BottomSheet/OpenBottomSheet';
import CocktailCard from '../../Components/CocktailCard';
import FilterBottomSheet, { FilterBottomSheetRef } from '../../Components/BottomSheet/FilterBottomSheet/FilterBottomSheet';
import useAllCocktailViewModel from './AllCocktailViewModel';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/Navigation';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'AllCocktailScreen'>;

const AllCocktailScreen = ({ navigation }: Props) => {
    const vm = useAllCocktailViewModel();
    const filterRef = useRef<FilterBottomSheetRef>(null);
    const bottomSheetRef = useRef<OpenBottomSheetHandle>(null);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <FlatList
                extraData={[vm.loading, vm.appliedFilter]}
                onEndReached={() => {
                    if (!vm.isLast && !vm.loading) {
                        vm.loadMore();
                    }
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    vm.loading && vm.results.length > 0 ? (
                        <ActivityIndicator style={{ marginVertical: 20 }} color="#111" />
                    ) : null
                }
                data={(vm.results.length === 0 && vm.loading) || vm.error ? [] : vm.results}
                style={{ flex: 1 }}
                numColumns={2}
                columnWrapperStyle={styles.row}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View>
                        {/* SearchResultScreen과 동일한 헤더 디자인 */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <MIcon name="chevron-left" size={24} color="#000" />
                            </TouchableOpacity>
                            <View style={styles.titleContainer}>
                                <Text style={styles.titleText}>칵테일 리스트</Text>
                            </View>
                            <View style={{ width: 24 }} />
                        </View>
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
                                        contentStyle={styles.filterButtonContent}
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
                        {!vm.loading && (
                            <>
                                <Text style={styles.text}>아직 준비된 칵테일이 없네요.</Text>
                                <Text style={styles.text}>다른 필터를 선택해보시겠어요?</Text>
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
                            onPress={() =>
                                navigation.navigate('CocktailDetailScreen', {
                                    cocktailId: item.id,
                                })
                            }
                            onToggleBookmark={() => {
                                vm.bookmarked(item.id);
                            }}
                        />
                    </View>
                )}
            />

            <OpenBottomSheet
                ref={bottomSheetRef}
                footer={
                    <View style={styles.footer}>
                        <Pressable style={styles.resetButton} onPress={() => filterRef.current?.reset()}>
                            <MIcon name="refresh" size={20} color="#444" style={styles.resetIcon} />
                            <Text style={styles.resetText}>초기화</Text>
                        </Pressable>

                        <Pressable
                            style={styles.applyButton}
                            onPress={() => {
                                filterRef.current?.apply();
                                bottomSheetRef.current?.close?.();
                            }}
                        >
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

export default AllCocktailScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.background,
    },
    header: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    titleText: {
        fontFamily: 'Pretendard-Medium',
        fontSize: fontPercentage(18),
        fontWeight: '600',
        color: '#000',
    },
    filterView: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: widthPercentage(8),
        paddingVertical: 4,
        gap: 8,
    },
    filterButtonContent: {
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
    text: {
        color: '#BDBDBD',
        fontFamily: 'Pretendard-Medium',
        fontSize: fontPercentage(16),
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.background,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
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
    },
    resetIcon: {
        marginRight: 4,
        transform: [{ scaleX: -1 }],
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
        fontWeight: '600',
    },
});
