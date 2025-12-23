import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Appbar, Divider, IconButton, Text } from 'react-native-paper';
import theme from '../../assets/styles/theme';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import PuzzlePiece from '../../configs/CurvedImage';
import { truncate } from 'lodash';
import PillStyleStatus from '../../Components/PillStyleStatus';
import PagerView from 'react-native-pager-view';
import CocktailCard from '../../Components/CocktailCard';
import { useNavigation } from '@react-navigation/native';
import { useHomeViewModel } from './CocktailListViewModel';
const Home = () => {

  const [pageIndex, setPageIndex] = useState(0);
  const navigation = useNavigation<any>();

  const {
    randomCocktail,
    bestCocktail,
    newCocktail,
    refreshList,
    beginnerList,
    intermediateList,

  } = useHomeViewModel();

  const pages = useMemo(() => {
    const result = [];
    for (let i = 0; i < newCocktail.length; i += 3) {
      result.push(newCocktail.slice(i, i + 3));
    }
    return result;
  }, [newCocktail]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 헤더 */}
      <Appbar.Header style={styles.header}>
        {/* 왼쪽 로고 */}
        <Image
          source={require('../../assets/drawable/banner.jpg')}
          style={styles.bannerImage}
          resizeMode="contain"
        />
        {/* 가운데 공백 */}
        <Appbar.Content title="" />

        {/* 오른쪽 아이콘 */}
        <Appbar.Action icon="magnify" onPress={() => { navigation.navigate('SearchScreen' as never); }} />
        <Appbar.Action icon="bookmark-outline" onPress={() => { navigation.navigate('CocktailBoxScreen' as never); }} />
      </Appbar.Header>


      {/* 컨텐츠 뷰 */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.allScrollView}
      >
        {/* 메인 사진 */}
        <View style={styles.randomWrapper}>
          <Image source={{ uri: randomCocktail?.image }} style={styles.mainImage} />
          <Text style={styles.bannerKoText}>{randomCocktail?.korName}</Text>
          <Text style={styles.bannerEnText}>{randomCocktail?.engName}</Text>
        </View>

        {/* Best 입문자용 칵테일 */}
        <View style={styles.bestSectionWrapper}>
          <Text variant="bodyLarge" style={styles.mainText}>
            Best 입문자용 칵테일
          </Text>
          <FlatList
            data={bestCocktail}
            keyExtractor={item => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('CocktailDetailScreen', {
                    cocktailId: item.id,
                  })
                }
              >
                <View style={styles.card}>
                  <PuzzlePiece source={{ uri: item.image }} size={210} toothR={100} />

                  {/* 랭크 */}
                  <View style={styles.bestRankWrapper}>
                    <Text style={styles.bestRankText}>{index + 1}</Text>
                  </View>

                  {/* 제목 */}
                  <View style={styles.bestTitleWrapper}>
                    <Text style={styles.bestTitleText}>
                      {truncate(item.name, { length: 7, omission: '...' })}
                    </Text>
                  </View>

                  {/* 북마크 아이콘 */}
                  <IconButton
                    icon="bookmark-outline"
                    onPress={() => { }}
                    size={28}
                    iconColor="#fff"
                    style={styles.bestBookmarkButton}
                    accessibilityLabel="즐겨찾기"
                  />
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* 새로 업데이트 된 칵테일 리스트 */}
        <View>
          <Text variant="bodyLarge" style={styles.mainText}>
            새로 업데이트 된 칵테일
          </Text>
          <PagerView
            style={styles.pagerView}
            initialPage={0}
            onPageSelected={e => setPageIndex(e.nativeEvent.position)}
          >
            {pages.map((items, p) => (
              <View key={p} style={styles.pagerPage}>
                {items.map(item => (
                  <View key={item.id} style={styles.newCocktailRow}>
                    <Image source={{ uri: item.image }} style={styles.newCocktailImage} />
                    <View style={styles.newCocktailTextWrapper}>
                      <PillStyleStatus tone={item.type} />
                      <Text>{item.name}</Text>
                    </View>

                    <IconButton
                      icon={'bookmark-outline'}
                      onPress={() => { }}
                      size={28}
                      iconColor="#000"
                      style={styles.newCocktailBookmark}
                    />
                  </View>
                ))}
              </View>
            ))}
          </PagerView>

          {/* 인디케이터 */}
          <View style={styles.indicatorContainer}>
            {pages.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.indicatorDot,
                  pageIndex === i && styles.indicatorDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <Divider style={styles.sectionDivider} />

        <Text variant="bodyLarge" style={styles.mainText}>
          기분 전환이 필요할 땐 상큼한 한 잔 🍋
        </Text>
        <FlatList
          data={refreshList}
          horizontal
          keyExtractor={item => String(item.id)}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <CocktailCard
              id={item.id}
              name={item.name}
              image={item.image}
              type={item.type}
              bookmarked={true}
              onPress={() =>
                navigation.navigate('CocktailDetailScreen', {
                  cocktailId: item.id,
                })
              }
              onToggleBookmark={_next => { }}
            />
          )}
        />

        <Text variant="bodyLarge" style={styles.mainText}>
          부담 없이 편하게 시도할 수 있는 맛 🧃
        </Text>
        <FlatList
          data={beginnerList}
          horizontal
          keyExtractor={item => String(item.id)}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <CocktailCard
              id={item.id}
              name={item.name}
              image={item.image}
              type={item.type}
              bookmarked={true}
              onPress={() =>
                navigation.navigate('CocktailDetailScreen', {
                  cocktailId: item.id,
                })
              }
              onToggleBookmark={_next => { }}
            />
          )}
        />

        <Text variant="bodyLarge" style={styles.mainText}>
          중급자로 거듭나보고 싶다면? 🥃
        </Text>
        <FlatList
          data={intermediateList}
          horizontal
          keyExtractor={item => String(item.id)}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <CocktailCard
              id={item.id}
              name={item.name}
              image={item.image}
              type={item.type}
              bookmarked={true}
              onPress={() =>
                navigation.navigate('CocktailDetailScreen', {
                  cocktailId: item.id,
                })
              }
              onToggleBookmark={_next => { }}
            />
          )}
        />
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    gap: 8,
  },
  header: {
    backgroundColor: theme.background,
    paddingHorizontal: 8,
  },
  randomWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  bannerImage: {
    width: widthPercentage(120),
    height: heightPercentage(40),
  },
  bannerKoText: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    right: 24,
    textAlign: 'center',
    color: '#fff',
    fontSize: fontPercentage(18),
    fontWeight: '600',
  },
  bannerEnText: {
    position: 'absolute',
    bottom: 60,
    left: 24,
    right: 24,
    color: '#fff',
    textAlign: 'center',
    fontSize: fontPercentage(20),
    fontWeight: '600',
  },
  mainText: {
    fontWeight: '700',
    paddingVertical: 10,
    alignContent: 'flex-start',
    paddingLeft: 10,
    borderRadius: 16,
  },
  filterView: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: widthPercentage(8),
    paddingVertical: heightPercentage(6),
    gap: 8,
  },
  filterButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row-reverse',
    height: 30,
    paddingHorizontal: 10,
  },
  allScrollView: {
    marginTop: heightPercentage(10),
    paddingVertical: heightPercentage(10),
  },
  chip: {
    borderRadius: 100,
    borderWidth: 1,
    minHeight: 0,
    marginBottom: heightPercentage(10),
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
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  mainImage: {
    width: widthPercentage(357),
    height: heightPercentage(457),
    borderRadius: 16,
  },
  bestSectionWrapper: {
    alignItems: 'flex-start',
  },
  card: {
    width: widthPercentage(160),
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: widthPercentage(10),
    marginBottom: 100,
  },
  bestRankWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 0,
  },
  bestRankText: {
    fontSize: fontPercentage(24),
    fontWeight: 'bold',
    color: '#000',
  },
  bestTitleWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 0,
    alignItems: 'center',
  },
  bestTitleText: {
    fontSize: fontPercentage(16),
    fontWeight: 'bold',
    color: '#FFF',
  },
  bestBookmarkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    position: 'absolute',
    right: 1,
  },
  pagerView: {
    width: Dimensions.get('window').width,
    height: 3 * 78,
  },
  pagerPage: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  newCocktailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  newCocktailImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  newCocktailTextWrapper: {
    marginLeft: 10,
    alignItems: 'center',
  },
  newCocktailBookmark: {
    marginLeft: 'auto',
    alignSelf: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
    backgroundColor: '#ccc',
  },
  indicatorDotActive: {
    backgroundColor: '#333',
  },
  sectionDivider: {
    marginVertical: heightPercentage(15),
    height: 12,
    backgroundColor: '#e8e8e8',
  },
  bestImage: {
    width: 'auto',
    height: heightPercentage(100),
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  overlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Home;
