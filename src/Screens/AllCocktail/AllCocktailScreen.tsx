// AllCocktailScreen.tsx

import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, Pressable, ScrollView, TouchableOpacity, Platform, Image, FlatList } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarSpace } from '../../lib/layout';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import { colors } from '../../lib/theme';
import OpenBottomSheet, { OpenBottomSheetHandle } from '../../Components/BottomSheet/OpenBottomSheet';
import CocktailCard from '../../Components/CocktailCard';
import { CocktailCard as CocktailCardModel } from '../../model/domain/CocktailCard';
import FilterBottomSheet, { FilterBottomSheetRef } from '../../Components/BottomSheet/FilterBottomSheet/FilterBottomSheet';
import useAllCocktailViewModel from './AllCocktailViewModel';
import ErrorState from '../../Components/common/ErrorState';
import EmptyState from '../../Components/common/EmptyState';
import SkeletonList from '../../Components/common/SkeletonList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/Navigation';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';

type StackProps = NativeStackScreenProps<RootStackParamList, 'AllCocktailScreen'>;

/**
 * embedded=true 이면 RecipeBookScreen 이 헤더(제목+검색)를 대신 그리므로
 * 자체 헤더와 상단 세이프에어리어 여백을 생략한다. 필터 칩은 그대로 유지.
 */
type Props = Omit<Partial<StackProps>, 'navigation'> & {
    navigation: StackProps['navigation'] | any;
    embedded?: boolean;
};

const AllCocktailScreen = ({ navigation, embedded = false }: Props) => {
    const insets = useSafeAreaInsets();
    const tabBarSpace = useTabBarSpace();
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

    // 로딩 / 에러 / 빈 상태를 구분한다.
    // 이전에는 vm.error 를 계산만 하고 렌더하지 않아, 조회 실패가 "결과 없음"으로 보였다.
    const ListEmptyComponent = useMemo(
        () => {
            if (vm.loading) { return <SkeletonList count={4} variant="card" />; }
            if (vm.error) { return <ErrorState message={vm.error} onRetry={vm.refetch} compact />; }
            return (
                <EmptyState
                    title="아직 준비된 칵테일이 없네요"
                    description="다른 필터를 선택해보시겠어요?"
                    compact
                />
            );
        },
        [vm.loading, vm.error, vm.refetch],
    );

    return (
        <View style={styles.container}>
            {/* 고정 헤더 영역 */}
            <View style={[styles.stickyHeader, { paddingTop: embedded ? 0 : insets.top }]}>
            {!embedded && (
            <View style={styles.header}>
                <View style={styles.titleWrapper}>
                    <Text style={styles.libraryTitle}>칵테일 레시피</Text>
                    <Text style={styles.librarySubtitle}>방대한 데이터로 만나는 완벽한 한 잔</Text>
                </View>
                <TouchableOpacity
                    onPress={() => (navigation as any).navigate('SearchScreen')}
                    style={styles.searchCircleButton}
                    accessibilityRole="button"
                    accessibilityLabel="칵테일 검색"
                >
                    <Image
                        source={require('../../assets/drawable/SharpSearch.png')}
                        style={styles.searchIcon}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>
            )}
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
                contentContainerStyle={[styles.listContent, { paddingBottom: tabBarSpace }]}
                initialNumToRender={6}
                maxToRenderPerBatch={4}
                windowSize={5}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={50}
            />

            <OpenBottomSheet
                ref={bottomSheetRef}
                // 레시피북 탭에 박혀 있을 때(embedded)만 떠 있는 탭바가 푸터를 덮는다.
                avoidTabBar={embedded}
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
        </View>
    );
};

export default AllCocktailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    safeArea: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    stickyHeader: {
        backgroundColor: colors.bg,
        zIndex: 10,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    titleWrapper: {
        flex: 1,
    },
    libraryTitle: {
        fontFamily: 'Pretendard-Bold',
        fontSize: fontPercentage(24),
        color: '#1a1a1a',
        marginBottom: 4,
    },
    librarySubtitle: {
        fontFamily: 'Pretendard-Regular',
        fontSize: fontPercentage(13),
        color: '#888',
    },
    searchCircleButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    searchIcon: {
        width: 22,
        height: 22,
        tintColor: '#1a1a1a',
    },
    filterView: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 8,
        gap: 8,
        paddingBottom: 24,
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
        backgroundColor: colors.bg,
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
    listContent: {},
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
        fontFamily: 'Pretendard-Regular',
        fontSize: fontPercentage(16),
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.bg,
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
    },
});
