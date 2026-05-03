import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import useCocktailBoxViewModel from './CocktailBoxViewModel';
import { FlatList } from 'react-native-gesture-handler';
import CocktailCard from '../../Components/CocktailCard';
import Icon from 'react-native-vector-icons/Ionicons';
const CocktailBoxScreen = () => {
    const navigation = useNavigation<any>();
    const vm = useCocktailBoxViewModel();
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
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerSide}>
                            <Icon name="chevron-back-sharp" size={24} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>칵테일 보관함</Text>
                        <View style={styles.headerSide} />
                    </View>
                }

                // 데이터가 없을 때의 화면
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {vm.loading ? (
                            <ActivityIndicator size="large" color="#111" />
                        ) : (
                            <View style={styles.textContainer}>
                                <Text style={styles.emptyTitle}>아직 저장한 칵테일이 없네요.</Text>
                                <Text style={styles.emptySub}>마음에 드는 칵테일을 찾아볼까요?</Text>
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
                            bookmarked={true}
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
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: heightPercentage(52),
        paddingHorizontal: widthPercentage(16),
        marginBottom: heightPercentage(8),
    },
    headerTitle: {
        fontSize: fontPercentage(16),
        fontFamily: 'Pretendard-SemiBold',
        color: '#1B1B1B',
    },
    headerSide: {
        width: widthPercentage(32),
        alignItems: 'flex-start',
    },
    // 헤더 관련 스타일 (SearchResultScreen 양식 참고)
    headerContainer: {
        backgroundColor: '#FFF',
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
        fontWeight: '600',
        fontFamily: 'Pretendard',
        fontSize: fontPercentage(16),
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
        fontWeight: '600',
        color: '#1B1B1B',
        marginBottom: 4,
    },
    emptySub: {
        fontSize: fontPercentage(14),
        color: '#BDBDBD',
        fontWeight: '500',
    },
});
