import React, { useRef } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { ActivityIndicator, Appbar, Button, Text } from 'react-native-paper';
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


type Props = NativeStackScreenProps<RootStackParamList, 'AllCocktailScreen'>;

const AllCocktailScreen = ({ navigation }: Props) => {
    const vm = useAllCocktailViewModel();

    const filterRef = useRef<FilterBottomSheetRef>(null);
    const bottomSheetRef = useRef<OpenBottomSheetHandle>(null);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <FlatList
                extraData={vm.loading}
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
                style={{ flex: 1, backgroundColor: theme.background }}
                numColumns={2}
                key={2}
                columnWrapperStyle={styles.row}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}


                ListHeaderComponent={
                    <View>
                        <Appbar.Header style={styles.header}>
                            <Appbar.Action icon="chevron-left" onPress={() => navigation.goBack()} />
                            <Appbar.Content
                                titleStyle={styles.titleText}
                                title="칵테일 리스트"
                                style={styles.contentCenter}
                            />
                        </Appbar.Header>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterView}
                        >
                            {['최신순', '도수', '스타일', '맛', '베이스'].map((label, idx) => {
                                const filter = vm.appliedFilter;
                                // 1. 각 버튼별로 데이터가 있는지 확인
                                const isSelected =
                                    (label === '최신순' && filter.sort !== '최신순') ||
                                    (label === '도수' && filter.degree) ||
                                    (label === '스타일' && filter.style) ||
                                    (label === '맛' && filter.taste.length > 0) ||
                                    (label === '베이스' && filter.base.length > 0);

                                return (
                                    <Button
                                        key={idx}
                                        mode={isSelected ? 'contained' : 'outlined'} // 강조를 위해 mode 변경 가능
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
                        {!vm.loading && vm.error && <Text style={styles.text}>{vm.error}</Text>}
                        {!vm.loading && !vm.error && vm.results?.length === 0 && (
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
                            onPress={() => { navigation.navigate('CocktailDetailScreen', { cocktailId: item.id }); }}
                        />
                    </View>
                )}
            />

            {/* 바텀시트 설정 */}
            <OpenBottomSheet
                ref={bottomSheetRef}
                footer={
                    <View style={styles.footer}>
                        <Pressable style={styles.resetButton} onPress={() => filterRef.current?.reset()}>
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
        backgroundColor: theme.background,
        position: 'relative',
    },
    contentCenter: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: fontPercentage(20),
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
    listContent: {
        paddingBottom: 24,
        backgroundColor: theme.background,
        flexGrow: 1,
    },
    row: {
        justifyContent: 'flex-start',
        marginBottom: 16,
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
    chipSelected: {
        backgroundColor: '#313131',
        borderColor: '#E0E0E0',
    },
    chipLabel: {
        fontSize: 10,
        lineHeight: 11,
        color: '#333333',
    },
    chipLabelSelected: {
        fontSize: 10,
        lineHeight: 11,
        color: '#FFFFFF',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    cardWrapper: {
        width: '50%',
        alignItems: 'center',
    },
    text: {
        color: '#BDBDBD',
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
        borderTopColor: '#eee',
    },
    resetButton: {
        flex: 1,
        height: heightPercentage(50),
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D0D0D0',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.background,
    },
    applyButton: {
        flex: 1,
        height: heightPercentage(50),
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111111',
    },
    resetText: {
        fontSize: 14,
        color: '#444444',
        fontWeight: '500',
    },
    applyText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
