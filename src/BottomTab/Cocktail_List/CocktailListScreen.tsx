import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { Appbar, Divider, Text } from 'react-native-paper';
import theme from '../../assets/styles/theme';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';

import { truncate } from 'lodash';
import PillStyleStatus from '../../Components/PillStyleStatus';
import PagerView from 'react-native-pager-view';
import CocktailCard from '../../Components/CocktailCard';
import { useNavigation } from '@react-navigation/native';
import { useHomeViewModel } from './CocktailListViewModel';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PuzzlePiece from '../../configs/CurvedImage';
import LinearGradient from 'react-native-linear-gradient';
const Home = () => {




  const [pageIndex, setPageIndex] = useState(0);
  const navigation = useNavigation<any>();
  const { width: windowWidth } = useWindowDimensions();

  const vm = useHomeViewModel();
  const insets = useSafeAreaInsets();
  // 탭바 높이(58) + 탭바 bottom(insets.bottom + 12) + 여유 여백(16)
  const tabBarSpace = heightPercentage(58) + insets.bottom + 12 + 16;


  const iconColor = vm.isScrolled ? '#000000' : '#ffffff';
  useEffect(() => {
    if (vm.bestCocktail && vm.bestCocktail.length > 0) {
      vm.bestCocktail.forEach(item => {
        if (item.image) { Image.prefetch(item.image); }
      });
    }

  }, [vm.bestCocktail]);

  const pages = useMemo(() => {
    const result = [];
    for (let i = 0; i < vm.newCocktail.length; i += 3) {
      result.push(vm.newCocktail.slice(i, i + 3));
    }
    return result;
  }, [vm.newCocktail]);

  const renderBestItem = useCallback(({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('CocktailDetailScreen', { cocktailId: item.id })}
    >
      <View style={styles.card}>
        <PuzzlePiece uri={item.image} size={210} />
        <View style={styles.bestRankWrapper}>
          <Text style={styles.bestRankText}>{index + 1}</Text>
        </View>
        <View style={styles.bestTitleWrapper}>
          <Text style={styles.bestTitleText}>
            {truncate(item.name, { length: 7, omission: '...' })}
          </Text>
        </View>
        <TouchableOpacity style={styles.bestBookmarkButton} onPress={() => vm.bookmarked(item.id)}>
          <Image
            source={item.isBookmarked
              ? require('../../assets/drawable/full_save.png')
              : require('../../assets/drawable/save.png')}
            style={item.isBookmarked ? { width: 20, height: 20, tintColor: '#FFF' } : { width: 20, height: 20 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), [navigation, vm]);

  const renderCocktailCard = useCallback(({ item }: { item: any }) => (
    <CocktailCard
      id={item.id}
      name={item.name}
      image={item.image}
      type={item.type}
      bookmarked={item.isBookmarked}
      onPress={() => navigation.navigate('CocktailDetailScreen', { cocktailId: item.id })}
      onToggleBookmark={() => vm.bookmarked(item.id)}
    />
  ), [navigation, vm]);

  return (
    <View style={styles.container}>

      {/* 상단 헤더 */}
      <StatusBar barStyle={vm.isScrolled ? 'dark-content' : 'light-content'} backgroundColor={vm.isScrolled ? '#ffffff' : '#000000'} />
      <Appbar.Header style={[, { marginLeft: widthPercentage(16), backgroundColor: vm.isScrolled ? '#fff' : '#000' }]}>
        {/* 왼쪽 로고 */}
        <Image
          source={
            vm.isScrolled ? require('../../assets/drawable/banner_black.png') : require('../../assets/drawable/banner_white.png')}
          style={styles.bannerImage}
          resizeMode="contain"
        />
        {/* 가운데 공백 */}
        <Appbar.Content title="" />

        {/* 오른쪽 아이콘 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: widthPercentage(8) }}>

          {/* 검색 버튼 */}
          <TouchableOpacity
            onPress={() => navigation.navigate('SearchScreen')}
            style={styles.customIconButton}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/drawable/SharpSearch.png')}
              style={{
                width: 28,
                height: 28,
                tintColor: iconColor,
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 저장 버튼 */}
          <TouchableOpacity
            onPress={() => vm.bookMarkCheck()}
            style={styles.customIconButton}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/drawable/save.png')}
              style={{
                width: 15,
                height: 19,
                tintColor: iconColor,
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Appbar.Header>


      {/* 컨텐츠 뷰 */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.allScrollView}
        onScroll={vm.handleScroll}
        scrollEventThrottle={16}
      >
        {/* 메인 사진 */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => vm.randomCocktail?.id && navigation.navigate('CocktailDetailScreen', { cocktailId: vm.randomCocktail.id })}
        >
          <View style={styles.randomWrapper}>
            <View style={styles.mainImageShadow}>

              <View style={styles.mainImageClip}>
                <FastImage
                  source={{ uri: vm.randomCocktail?.image, priority: FastImage.priority.high }}
                  style={styles.mainImage}
                  resizeMode={FastImage.resizeMode.cover}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.gradientOverlay}
                />
              </View>

            </View>

            <Text style={styles.bannerKoText}>오늘의 칵테일</Text>
            <Text style={styles.bannerEnText}>{vm.randomCocktail?.engName}</Text>
          </View>
        </TouchableOpacity>

        {/* Best 입문자용 칵테일 */}

        <View style={styles.bestSectionWrapper}>
          <Text variant="bodyLarge" style={[styles.mainText, { marginLeft: widthPercentage(16), marginBottom: heightPercentage(16) }]}>
            Best 입문자용 칵테일
          </Text>
          <FlatList
            data={vm.bestCocktail}
            extraData={vm.bestCocktail}
            removeClippedSubviews={false}
            ItemSeparatorComponent={() => <View style={{ width: widthPercentage(10) }} />}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            style={{ height: heightPercentage(210) }}
            keyExtractor={item => String(item.id)}
            windowSize={3}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderBestItem}
          />
        </View>

        {/* 새로 업데이트 된 칵테일 리스트 */}
        <View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: heightPercentage(48),
            paddingHorizontal: widthPercentage(16),
            paddingBottom: heightPercentage(16),
          }}>
            <Text variant="bodyLarge" style={[styles.mainText, { paddingTop: 0 }]}>
              새로 업데이트 된 칵테일
            </Text>

            <TouchableOpacity
              onPress={() => { navigation.navigate('AllCocktailScreen' as never); }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',

              }}
            >
              <Text style={{
                color: '#616161',
                fontSize: fontPercentage(14),
                includeFontPadding: false,
                textAlignVertical: 'center',
                fontWeight: '500',
              }}>
                더보기
              </Text>
              <MaterialIcons name="chevron-right" color="#616161" size={20} />
            </TouchableOpacity>
          </View>
          <PagerView
            style={[styles.pagerView, { width: windowWidth }]}
            initialPage={0}
            onPageSelected={e => setPageIndex(e.nativeEvent.position)}
          >
            {pages.map((items, p) => (
              <View key={p} style={styles.pagerPage}>
                {items.map(item => (
                  <View key={item.id} style={styles.newCocktailRow}>

                    <FastImage
                      source={{ uri: item.image, priority: FastImage.priority.normal }}
                      style={styles.newCocktailImage}
                      resizeMode={FastImage.resizeMode.cover}
                    />

                    <TouchableOpacity style={styles.newCocktailTextWrapper}
                      onPress={() => navigation.navigate('CocktailDetailScreen', {
                        cocktailId: item.id,
                      })}>
                      <PillStyleStatus tone={item.type} />
                      <Text style={styles.newCocktailName}>{item.name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.newCocktailBookmark}
                      onPress={() => vm.bookmarked(item.id)}
                    >
                      <Image
                        source={
                          item.isBookmarked
                            ? require('../../assets/drawable/full_save.png')
                            : require('../../assets/drawable/save.png')
                        }
                        style={{
                          width: 15,
                          height: 19,
                          tintColor: '#000',
                        }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
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

        <Text variant="bodyLarge" style={[styles.mainText, { marginTop: heightPercentage(48), marginLeft: widthPercentage(16), marginBottom: heightPercentage(16) }]}>
          기분 전환이 필요할 땐 상큼한 한 잔 🍋
        </Text>
        <FlatList
          data={vm.refreshList}
          extraData={vm.refreshList}
          horizontal
          style={{ height: heightPercentage(220) + 40 }}
          ItemSeparatorComponent={() => <View style={{ width: widthPercentage(10) }} />}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          keyExtractor={item => String(item.id)}
          showsHorizontalScrollIndicator={false}
          renderItem={renderCocktailCard}
        />

        <Text variant="bodyLarge" style={[styles.mainText, { marginTop: heightPercentage(48), marginLeft: widthPercentage(16), marginBottom: heightPercentage(16) }]}>
          부담 없이 편하게 시도할 수 있는 맛 🧃
        </Text>
        <FlatList
          data={vm.beginnerList}
          extraData={vm.beginnerList}
          horizontal
          style={{ height: heightPercentage(220) + 40 }}
          keyExtractor={item => String(item.id)}
          ItemSeparatorComponent={() => <View style={{ width: widthPercentage(10) }} />}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          showsHorizontalScrollIndicator={false}
          renderItem={renderCocktailCard}
        />

        <Text variant="bodyLarge" style={[styles.mainText, { marginTop: heightPercentage(48), marginLeft: widthPercentage(16), marginBottom: heightPercentage(16) }]}>
          중급자로 거듭나보고 싶다면? 🥃
        </Text>
        <FlatList
          data={vm.intermediateList}
          extraData={vm.intermediateList}
          horizontal
          style={{ height: heightPercentage(220) + 40 }}
          ItemSeparatorComponent={() => <View style={{ width: widthPercentage(10) }} />}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          keyExtractor={item => String(item.id)}
          showsHorizontalScrollIndicator={false}
          renderItem={renderCocktailCard}
        />
        <View style={{ height: tabBarSpace }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,

  },
  newCocktailName: {
    fontSize: fontPercentage(16),
    color : '#000000',
    fontWeight: '500',
    fontFamily: 'Pretendard-Medium',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: heightPercentage(150),
  },
  randomWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  bannerImage: {
    width: '20%',
    height: heightPercentage(40),
  },
  mainImageShadow: {
    width: '100%',
    backgroundColor: 'white',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,

    elevation: 10,
  },

  mainImageClip: {
    width: '100%',
    height: heightPercentage(457),
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  bannerKoText: {
    fontFamily: 'Pretendard-SemiBold',
    position: 'absolute',
    bottom: 95,
    left: 24,
    right: 24,
    textAlign: 'center',
    color: '#fff',
    fontSize: fontPercentage(18),
    fontWeight: '600',
  },
  bannerEnText: {
    position: 'absolute',
    fontFamily: 'NotoSerif-BoldItalic',
    bottom: 60,
    left: 24,
    right: 24,
    color: '#fff',
    textAlign: 'center',
    fontSize: fontPercentage(20),
  },
  mainText: {
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color : '#000000'
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
    paddingBottom: heightPercentage(10),
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
    width: '100%',
    height: heightPercentage(457),
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,

    elevation: 10,
  },
  customIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  bestSectionWrapper: {
    alignItems: 'flex-start',
    paddingTop: heightPercentage(51),
  },
  card: {
    width: widthPercentage(160),
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: widthPercentage(10),
  },
  bestRankWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 0,
  },
  bestRankText: {
    fontFamily: 'NotoSerif-BoldItalic',
    fontStyle: 'italic',
    fontSize: fontPercentage(24),
    fontWeight: '700',
    color: '#000',
  },
  bestTitleWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 65,
    right: 0,
    alignItems: 'flex-start',
  },
  bestTitleText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: fontPercentage(16),
    color: '#FFF',
    textAlign: 'left',
  },
  bestBookmarkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    position: 'absolute',
    right: 5,
    top: 15,
  },
  pagerView: {
    height: heightPercentage(3 * 78),
  },
  pagerPage: {
    paddingTop: 4,
  },
  newCocktailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 16,
    marginRight: 10,
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
    marginBottom: heightPercentage(24),
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
