// AllCocktailScreen.tsx

import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, Pressable, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import { FlatList } from 'react-native-gesture-handler';
import theme from '../../assets/styles/theme';
import OpenBottomSheet, { OpenBottomSheetHandle } from '../../Components/BottomSheet/OpenBottomSheet';
import CocktailCard from '../../Components/CocktailCard';
import { CocktailCard as CocktailCardModel } from '../../model/domain/CocktailCard';
import FilterBottomSheet, { FilterBottomSheetRef } from '../../Components/BottomSheet/FilterBottomSheet/FilterBottomSheet';
import useAllCocktailViewModel from './AllCocktailViewModel';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/Navigation';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/Ionicons';
type Props = NativeStackScreenProps<RootStackParamList, 'AllCocktailScreen'>;

const AllCocktailScreen = ({ navigation }: Props) => {
    const vm = useAllCocktailViewModel();
    const filterRef = useRef<FilterBottomSheetRef>(null);
    const bottomSheetRef = useRef<OpenBottomSheetHandle>(null);

    const extraData = useMemo(
        () => ({ loading: vm.loading, filter: vm.appliedFilter }),
        [vm.loading, vm.appliedFilter],
    );

    const handleEndReached = useCallback(() => {
        if (!vm.isLast && !vm.loading) {
            vm.loadMore();
        }
    }, [vm]);

    const { bookmarked } = vm;

    const renderItem = useCallback(
        ({ item }: { item: CocktailCardModel }) => (
            <View style={styles.cardWrapper}>
                <CocktailCard
                    id={item.id}
                    name={item.name}
                    type={item.type}
                    image={item.image}
                    bookmarked={item.isBookmarked}
                    onPress={() =>
                        navigation.navigate('CocktailDetailScreen', {
                            cocktailId: item.id,
                        })
                    }
                    onToggleBookmark={() => bookmarked(item.id)}
                />
            </View>
        ),
        [navigation, bookmarked],
    );

    const keyExtractor = useCallback(
        (item: CocktailCardModel, index: number) => `${item.id}-${index}`,
        [],
    );

    const ListFooterComponent = useMemo(
        () =>
            vm.isFetchingNextPage ? (
                <ActivityIndicator style={{ marginVertical: 20 }} color="#111" />
            ) : null,
        [vm.isFetchingNextPage],
    );

    const ListHeaderComponent = null;

    const ListEmptyComponent = useMemo(
        () => (
            <View style={styles.emptyContainer}>
                {vm.loading && <ActivityIndicator size="large" />}
                {!vm.loading && (
                    <>
                        <Text style={styles.text}>아직 준비된 칵테일이 없네요.</Text>
                        <Text style={styles.text}>다른 필터를 선택해보시겠어요?</Text>
                    </>
                )}
            </View>
        ),
        [vm.loading],
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            {/* 고정 헤더 영역 */}
            <View style={styles.stickyHeader}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon
                            name="chevron-back-sharp"
                            size={24}
                            color="#000"
                            style={{ marginRight: widthPercentage(8) }}
                        />
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

            <FlatList
                data={vm.results}
                extraData={extraData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={ListHeaderComponent}
                ListFooterComponent={ListFooterComponent}
                ListEmptyComponent={ListEmptyComponent}
                numColumns={2}
                columnWrapperStyle={styles.row}
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                initialNumToRender={6}
                maxToRenderPerBatch={4}
                windowSize={5}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={50}
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
    stickyHeader: {
        backgroundColor: theme.background,
        zIndex: 10,
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
        fontSize: fontPercentage(16),
        color: '#000',
    },
    filterView: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: widthPercentage(8),
        paddingVertical: 4,
        gap: 8,
        paddingBottom: 20,
    },
    filterButtonContent: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chip: {
        borderRadius: 100,
        borderWidth: 1,

        minHeight: 32,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 0,
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
        flexDirection: 'row',
        justifyContent: 'center',
        gap: widthPercentage(12),
        marginBottom: 16,
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
