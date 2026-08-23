import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import useCocktailBoxViewModel from './CocktailBoxViewModel';

import CocktailCard from '../../Components/CocktailCard';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, fonts, radius } from '../../lib/theme';
import type { ArchiveTab } from '../../model/DataSource/BookMarksDataSource';
/** 보관함 탭 — 저장 말고도 내가 남긴 기록으로 칵테일을 되찾을 수 있어야 한다. */
const TABS: { key: ArchiveTab; label: string; emptyTitle: string; emptySub: string }[] = [
    { key: 'BOOKMARK', label: '저장', emptyTitle: '아직 저장한 칵테일이 없네요.', emptySub: '마음에 드는 칵테일을 찾아볼까요?' },
    { key: 'MADE', label: '만들어봤어요', emptyTitle: '아직 만들어본 칵테일이 없어요.', emptySub: '레시피를 보고 한 잔 만들어보세요.' },
    { key: 'RECOMMEND', label: '좋아요', emptyTitle: '아직 좋아요한 칵테일이 없어요.', emptySub: '상세 화면에서 반응을 남길 수 있어요.' },
    { key: 'HARD', label: '어려워요', emptyTitle: '어려워요로 표시한 칵테일이 없어요.', emptySub: '만들기 어려웠던 칵테일을 표시해두면 여기 모여요.' },
];

const CocktailBoxScreen = () => {
    const navigation = useNavigation<any>();
    const vm = useCocktailBoxViewModel();
    const current = TABS.find(t => t.key === vm.tab) ?? TABS[0];
    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={vm.loading ? [] : vm.results}
                numColumns={2}
                columnWrapperStyle={styles.row}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}

                // 상단 헤더를 리스트의 일부로 설정
                ListHeaderComponent={
                    <View>
                        <Appbar.Header style={{ backgroundColor: '#FFFFFF' }}>
                            <TouchableOpacity style={{ paddingLeft: 20 }}
                                onPress={() => navigation.goBack()}>
                                <Icon
                                    name="chevron-back-sharp"
                                    size={24}
                                    color="#000"
                                    style={{ marginRight: widthPercentage(8) }}
                                />
                            </TouchableOpacity>
                            <View style={{ flex: 0.8, alignItems: 'center' }}>
                                <Text style={{ fontSize: fontPercentage(16), fontFamily: 'Pretendard-SemiBold', color: '#1B1B1B' }}>칵테일 보관함</Text>
                            </View>

                        </Appbar.Header>

                        <View style={styles.tabBar}>
                            {TABS.map(t => {
                                const on = vm.tab === t.key;
                                return (
                                    <TouchableOpacity
                                        key={t.key}
                                        style={[styles.tab, on && styles.tabOn]}
                                        onPress={() => vm.setTab(t.key)}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: on }}
                                    >
                                        <Text style={[styles.tabText, on && styles.tabTextOn]} numberOfLines={1}>
                                            {t.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                }

                // 데이터가 없을 때의 화면
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {vm.loading ? (
                            <ActivityIndicator size="large" color="#111" />
                        ) : (
                            <View style={styles.textContainer}>
                                <Text style={styles.emptyTitle}>{current.emptyTitle}</Text>
                                <Text style={styles.emptySub}>{current.emptySub}</Text>
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
                            bookmarked={vm.tab === 'BOOKMARK' ? true : item.isBookmarked}
                            onPress={() =>
                                navigation.navigate('CocktailDetailScreen', { cocktailId: item.id })
                            }
                            onToggleBookmark={() => { }}
                        />
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

export default CocktailBoxScreen;

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        columnGap: widthPercentage(6),
        paddingHorizontal: widthPercentage(16),
        paddingBottom: heightPercentage(12),
    },
    tab: {
        flex: 1,
        paddingVertical: heightPercentage(8),
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabOn: { backgroundColor: colors.text, borderColor: colors.text },
    tabText: { fontFamily: fonts.medium, fontSize: fontPercentage(12), color: colors.textSecondary },
    tabTextOn: { color: colors.textInverse, fontFamily: fonts.semibold },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    // 헤더 관련 스타일 (SearchResultScreen 양식 참고)
    headerContainer: {
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        height: heightPercentage(60),
    },
    backButton: {
        marginLeft: 0,
    },
    titleWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#BDBDBD',
        fontFamily: 'Pretendard',
        fontSize: fontPercentage(16),
    },
    headerTitle: {
        fontSize: fontPercentage(20),
        fontFamily: fonts.bold,
        color: '#1B1B1B',
    },
    headerDivider: {
        height: 1,
        backgroundColor: '#F5F5F5',
        marginHorizontal: widthPercentage(16),
    },
    // 리스트 레이아웃
    listContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    row: {
        justifyContent: 'flex-start',
        paddingHorizontal: widthPercentage(12),
        marginBottom: 10,
    },
    cardWrapper: {
        width: '50%',
        alignItems: 'center',
    },
    // 데이터 없음 상태
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: heightPercentage(200), // 헤더 아래 중앙에 오도록 조정
    },
    textContainer: {
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: fontPercentage(16),
        fontFamily: fonts.medium,
        color: '#1B1B1B',
        marginBottom: 4,
    },
    emptySub: {
        fontSize: fontPercentage(14),
        color: '#BDBDBD',
        fontFamily: fonts.medium,
    },
});
