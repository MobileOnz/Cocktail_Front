// HomeFeedScreen.tsx (T-21)
// 탭1 홈 — GET /api/v2/main 한 번으로 [추천 히어로 + 뉴스/가이드 인터리브 피드]를 그린다.
// 무한 스크롤(nextCursor) + pull-to-refresh. 이전 CocktailListScreen 의 6개 병렬 호출을 대체.
import React, {useCallback, useMemo, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {
  fontPercentage,
  heightPercentage,
  widthPercentage,
} from '../../assets/styles/FigmaScreen';
import instance from '../../tokenRequest/axios_interceptor';
import {unwrap, toUserMessage} from '../../lib/api';
import {fonts, fontSize, spacing, night, space, round, koreanBreak} from '../../lib/theme';
import {RECOMMENDATION_WEB_URL} from '@env';
import type {
  FeedItem,
  Hero,
  MainResponse,
  NewsCard,
  NewsFeedResponse,
} from '../../types/api';
import ErrorState from '../../Components/common/ErrorState';
import EmptyState from '../../Components/common/EmptyState';
import SkeletonList from '../../Components/common/SkeletonList';
import TopRightMenu from '../../Components/common/TopRightMenu';
import {useTabBarSpace} from '../../lib/layout';
import {formatDate} from '../../lib/date';

/** 홈 '인기 레시피' 가로 섹션 카드. 레시피북(칵테일) 내용을 홈 피드에 혼합한다. */
type HomeCocktail = {id: number; korName: string; imageUrl?: string | null};

const PAGE_SIZE = 20;

const HomeFeedScreen = () => {
  const navigation = useNavigation<any>();
  const tabBarSpace = useTabBarSpace();

  const [hero, setHero] = useState<Hero | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  // main.feed 에는 type:'cocktail' 이 없어, 레시피북(칵테일) 내용을 홈에 혼합하기 위해
  // 칵테일 목록을 따로 불러 '인기 레시피' 섹션으로 붙인다. 보조 섹션이라 실패해도 조용히 비운다.
  const [cocktails, setCocktails] = useState<HomeCocktail[]>([]);
  // 추천 CTA와 '인기 레시피' 사이의 '최신 칵테일 뉴스' 가로 하이라이트.
  // /api/v2/main 피드에도 뉴스가 섞이지만, 여기선 최신 N건만 가로로 미리 보여준다.
  // 보조 섹션이라 실패해도 조용히 비운다(홈 본 피드에는 영향 없음).
  const [latestNews, setLatestNews] = useState<NewsCard[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 동시 요청/언마운트 후 setState 방지
  const inFlight = useRef(false);
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  // 홈은 섹션당 미리보기 3개만 보여준다(전체는 매거진 탭) — 더 이상 무한 스크롤하지 않는다.
  const fetchPage = useCallback(async (mode: 'initial' | 'refresh') => {
    if (inFlight.current) {
      return;
    }
    inFlight.current = true;

    if (mode === 'initial') {
      setLoading(true);
      setError(null);
    }
    if (mode === 'refresh') {
      setRefreshing(true);
    }

    try {
      const res = await instance.get('/api/v2/main', {
        params: {size: PAGE_SIZE},
      });
      const data = unwrap<MainResponse>(res);
      if (!mounted.current) {
        return;
      }

      setHero(data.hero ?? null);
      setFeed(data.feed ?? []);
      setError(null);
    } catch (e) {
      if (!mounted.current) {
        return;
      }
      setError(toUserMessage(e, '피드를 불러오지 못했습니다.'));
    } finally {
      inFlight.current = false;
      if (!mounted.current) {
        return;
      }
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPage('initial');
  }, [fetchPage]);

  useEffect(() => {
    let alive = true;
    instance
      .post(
        '/api/v2/cocktails',
        {},
        {params: {page: 0, size: 10, sort: 'korName,asc'}},
      )
      .then(res => {
        const content: HomeCocktail[] = res?.data?.data?.content ?? [];
        if (alive) {
          setCocktails(content);
        }
      })
      .catch(() => {
        /* 홈 보조 섹션 — 실패 시 무시 */
      });
    return () => {
      alive = false;
    };
  }, []);

  // 최신 칵테일 뉴스 (가로 하이라이트). NewsScreen 과 동일하게 /api/v2/news 를 쓴다.
  // 보조 섹션이라 실패해도 조용히 비운다.
  useEffect(() => {
    let alive = true;
    instance
      .get('/api/v2/magazine')
      .then(res => {
        const data = unwrap<NewsFeedResponse>(res);
        if (alive) {
          // API 가 오래된 순으로 내려와 '최신' 레일에 가장 오래된 기사가 실리던 문제 —
          // publishedAt 내림차순으로 정렬한 뒤 앞 10건을 쓴다.
          const sorted = [...(data.items ?? [])].sort(
            (a, b) =>
              new Date(b.publishedAt ?? 0).getTime() -
              new Date(a.publishedAt ?? 0).getTime(),
          );
          setLatestNews(sorted.slice(0, 10));
        }
      })
      .catch(() => {
        /* 홈 보조 섹션 — 실패 시 무시 */
      });
    return () => {
      alive = false;
    };
  }, []);

  const onRefresh = useCallback(() => fetchPage('refresh'), [fetchPage]);

  // '최신 칵테일 뉴스' 가로 레일에 이미 보인 뉴스는 세로 피드에서 뺀다.
  // 같은 기사·같은 썸네일이 한 화면에 두 번 보이던 중복(디자인 리뷰 P2-6) 제거.
  const visibleFeed = useMemo(() => {
    if (latestNews.length === 0) {
      return feed;
    }
    const shownNewsIds = new Set(latestNews.map(n => n.id));
    return feed.filter(
      item => !(item.type === 'news' && shownNewsIds.has(item.id)),
    );
  }, [feed, latestNews]);

  // "지금 읽어볼 이야기" / "알고 마시면 더 재미있는 칵테일" 은 미리보기라 3개만 보여준다.
  const newsPreview = useMemo(
    () =>
      visibleFeed
        .filter(
          (item): item is Extract<FeedItem, {type: 'news'}> =>
            item.type === 'news',
        )
        .slice(0, 3),
    [visibleFeed],
  );
  const guidePreview = useMemo(
    () =>
      feed
        .filter(
          (item): item is Extract<FeedItem, {type: 'guide'}> =>
            item.type === 'guide',
        )
        .slice(0, 3),
    [feed],
  );

  const openNews = useCallback(
    (id: number) => navigation.navigate('NewsDetailScreen', {newsId: id}),
    [navigation],
  );
  const openGuide = useCallback(
    () => navigation.navigate('GuideScreen'),
    [navigation],
  );

  const renderHero = () => {
    if (!hero) {
      return null;
    }
    return (
      <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>오늘의 추천</Text>
      </View>
      <TouchableOpacity
        style={styles.heroCard}
        activeOpacity={0.92}
        onPress={() =>
          navigation.navigate('CocktailDetailScreen', {
            cocktailId: hero.cocktailId,
          })
        }
        accessibilityRole="button"
        accessibilityLabel={`오늘의 추천 ${hero.name} 상세 보기`}>
        {!!hero.imageUrl && (
          <Image
            source={{uri: hero.imageUrl}}
            style={styles.heroImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.heroBody}>
          <Text style={styles.heroName}>{hero.name}</Text>
          {/* heroReason 은 서버가 내려주는 추천 근거. 그대로 노출한다. */}
          <Text style={styles.heroReason} {...koreanBreak}>{hero.heroReason}</Text>
        </View>
      </TouchableOpacity>
      </>
    );
  };

  // 뉴스 미리보기 카드 — "지금 읽어볼 이야기" 3개.
  const renderNewsCard = (item: Extract<FeedItem, {type: 'news'}>) => (
    <TouchableOpacity
      key={`news-${item.id}`}
      style={styles.newsCard}
      activeOpacity={0.92}
      onPress={() => openNews(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`뉴스 ${item.title} 열기`}>
      {/* imageUrl 은 서버가 null 이면 키째로 생략한다(NON_NULL). 없으면 이미지 영역을 아예 안 그린다. */}
      {!!item.imageUrl && (
        <Image
          source={{uri: item.imageUrl}}
          style={styles.newsImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.newsBody}>
        <View style={styles.newsMeta}>
          {/* 라벨은 서버(categoryLabel) 것을 쓴다. 프론트 하드코딩 매핑 제거. */}
          <Text style={styles.newsCategory}>
            {item.categoryLabel ?? '뉴스'}
          </Text>
          <Text style={styles.newsDate}>{formatDate(item.publishedAt)}</Text>
        </View>
        <Text
          style={styles.newsTitle}
          numberOfLines={2}
          lineBreakStrategyIOS="hangul-word"
          textBreakStrategy="balanced">
          {item.title}
        </Text>
        {!!item.summary && (
          <Text style={styles.newsSummary} numberOfLines={2}>
            {item.summary}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // 가이드 미리보기 카드 — "알고 마시면 더 재미있는 칵테일" 3개. 뉴스 카드와 같은 디자인을 쓴다.
  const renderGuideCard = (item: Extract<FeedItem, {type: 'guide'}>) => (
    <TouchableOpacity
      key={`guide-${item.part}`}
      style={styles.newsCard}
      activeOpacity={0.92}
      onPress={openGuide}
      accessibilityRole="button"
      accessibilityLabel={`가이드 ${item.title} 열기`}>
      {!!item.imageUrl && (
        <Image
          source={{uri: item.imageUrl}}
          style={styles.newsImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.newsBody}>
        <Text style={styles.newsCategory}>{`가이드 · Part ${item.part}`}</Text>
        <Text
          style={styles.newsTitle}
          numberOfLines={2}
          lineBreakStrategyIOS="hangul-word"
          textBreakStrategy="balanced">
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // 초기 로딩: 스켈레톤
  if (loading && feed.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={night.ink} />
        <View style={styles.appbar}>
          <Image
            source={require('../../assets/drawable/onz_logo.png')}
            style={styles.brand}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="onz"
          />
          <TopRightMenu tint={night.text} />
        </View>
        <SkeletonList count={3} variant="card" />
      </SafeAreaView>
    );
  }

  // 초기 로딩 실패: 전면 에러 + 재시도
  if (error && feed.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={night.ink} />
        <View style={styles.appbar}>
          <Image
            source={require('../../assets/drawable/onz_logo.png')}
            style={styles.brand}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="onz"
          />
          <TopRightMenu tint={night.text} />
        </View>
        <ErrorState message={error} onRetry={() => fetchPage('initial')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={night.ink} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          {paddingBottom: tabBarSpace},
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={night.accent}
          />
        }>
        <View style={styles.appbar}>
          <Image
            source={require('../../assets/drawable/onz_logo.png')}
            style={styles.brand}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="onz"
          />
          <View style={styles.appbarActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('SearchScreen')}
              accessibilityRole="button"
              accessibilityLabel="칵테일 검색"
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Image
                source={require('../../assets/drawable/SharpSearch.png')}
                style={styles.searchIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {/* 하단 탭에서 빠진 마이페이지의 새 진입점 */}
            <TopRightMenu tint={night.text} />
          </View>
        </View>

        {renderHero()}

        {/* 추천은 별도 웹앱(RECOMMENDATION_WEB_URL)을 웹뷰로 띄운다. 주소가 없으면
            눌러봐야 '연결할 수 없어요' 화면이 뜨므로, 아예 내보이지 않는다.
            홈에 문 모양만 있고 열리지 않는 문을 두지 않는다.
            표면색 박스로 감싸 봤더니 테두리 없는 홈에서 저것만 덩어리로 튀었고,
            아이콘 + 2줄 텍스트 탓에 좌측 선도 히어로·섹션 헤더의 거터와 어긋났다.
            → 배경 없이 한 줄로 두고 거터에 맞춘다. */}
        {RECOMMENDATION_WEB_URL ? (
          <TouchableOpacity
            style={styles.recommendCta}
            onPress={() => navigation.navigate('RecommendationIntro')}
            accessibilityRole="button"
            accessibilityLabel="나에게 맞는 칵테일 추천 받기"
            accessibilityHint="질문 몇 개에 답하면 취향에 가까운 칵테일을 골라줍니다">
            <Text style={styles.recommendCtaTitle}>
              나에게 맞는 칵테일 추천 받기
            </Text>
            <Text style={styles.recommendCtaArrow}>›</Text>
          </TouchableOpacity>
        ) : null}

        {latestNews.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최신 칵테일 뉴스</Text>
              {/* 탭 전환이라 탭바가 유지된다 — 스택 화면(NewsScreen)으로 푸시하면 탭바가 사라진다. */}
              <TouchableOpacity
                onPress={() => navigation.navigate('매거진')}
                accessibilityRole="button"
                accessibilityLabel="최신 칵테일 뉴스 전체보기"
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.sectionMore}>전체보기</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cocktailRow}>
              {latestNews.map(n => (
                <TouchableOpacity
                  key={`latest-news-${n.id}`}
                  style={styles.newsHCard}
                  activeOpacity={0.9}
                  onPress={() => openNews(n.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`뉴스 ${n.title} 열기`}>
                  {!!n.imageUrl && (
                    <Image
                      source={{uri: n.imageUrl}}
                      style={styles.newsHImage}
                      resizeMode="cover"
                    />
                  )}
                  <Text style={styles.newsHCategory} numberOfLines={1}>
                    {n.categoryLabel ?? '뉴스'}
                  </Text>
                  <Text
                    style={styles.newsHTitle}
                    numberOfLines={2}
                    lineBreakStrategyIOS="hangul-word"
                    textBreakStrategy="balanced">
                    {n.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {cocktails.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>인기 레시피</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('레시피북')}
                accessibilityRole="button"
                accessibilityLabel="레시피북 전체보기"
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.sectionMore}>전체보기</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cocktailRow}>
              {cocktails.map(c => (
                <TouchableOpacity
                  key={`cocktail-${c.id}`}
                  style={styles.cocktailCard}
                  activeOpacity={0.9}
                  onPress={() =>
                    navigation.navigate('CocktailDetailScreen', {
                      cocktailId: c.id,
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`레시피 ${c.korName} 상세 보기`}>
                  {!!c.imageUrl && (
                    <Image
                      source={{uri: c.imageUrl}}
                      style={styles.cocktailImage}
                      resizeMode="cover"
                    />
                  )}
                  <Text style={styles.cocktailName} numberOfLines={1}>
                    {c.korName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {newsPreview.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>지금 읽어볼 이야기</Text>
              {/* 전체 뉴스 목록(매거진 탭)의 유일한 진입점. 없애면 카테고리 필터에 도달할 수 없다. */}
              <TouchableOpacity
                onPress={() => navigation.navigate('매거진')}
                accessibilityRole="button"
                accessibilityLabel="칵테일 뉴스 전체보기"
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.sectionMore}>전체보기</Text>
              </TouchableOpacity>
            </View>
            {newsPreview.map(renderNewsCard)}
          </View>
        )}

        {newsPreview.length === 0 && guidePreview.length === 0 && (
          <EmptyState
            title="아직 보여드릴 이야기가 없어요"
            description="곧 새로운 뉴스와 가이드로 찾아올게요."
            actionLabel="새로고침"
            onAction={onRefresh}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeFeedScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: night.ink},
  listContent: {},

  appbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.gutter,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  // 텍스트 'onz' 대신 브랜드 워드마크(240×68, 비율 3.53:1)를 쓴다.
  // 높이를 기존 텍스트와 비슷하게 잡고 폭은 비율로 따라간다.
  // 로고 PNG 는 브랜드 자주색(#21103C)이 구워져 있어 자주색 배경에서 사라진다.
  // 알파 채널이 있으므로 tint 로 밝게 칠해 쓴다.
  brand: {
    height: heightPercentage(26),
    width: heightPercentage(26) * (240 / 68),
    tintColor: night.text,
  },
  appbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPercentage(spacing.md),
  },
  searchIcon: {width: widthPercentage(22), height: widthPercentage(22)},

  cocktailRow: {
    paddingHorizontal: space.gutter,
    paddingVertical: space.sm,
    gap: space.md,
  },
  cocktailCard: {width: widthPercentage(120)},
  cocktailImage: {
    width: widthPercentage(120),
    height: widthPercentage(120),
    borderRadius: round.sm,
    backgroundColor: night.surfaceHigh,
    marginBottom: space.sm,
  },
  cocktailName: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.sm),
    color: night.text,
  },

  // 최신 칵테일 뉴스 가로 카드 — 뉴스는 제목이 길어 레시피 카드보다 넓게 둔다.
  newsHCard: {width: widthPercentage(200)},
  newsHImage: {
    width: widthPercentage(200),
    height: widthPercentage(112),
    borderRadius: round.sm,
    backgroundColor: night.surfaceHigh,
    marginBottom: space.sm,
  },
  newsHCategory: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(fontSize.xs),
    color: night.accent,
    marginBottom: space.xs,
  },
  newsHTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.sm),
    color: night.text,
    lineHeight: fontPercentage(18),
  },

  // 테두리도 배경도 없다. 사진이 둥근 모서리로 잘리면 그게 카드 모양이고,
  // 글은 배경 위에 그대로 앉는다. 액자를 두르면 사진이 그 안에 갇힌다.
  heroCard: {
    marginHorizontal: space.gutter,
  },
  heroImage: {
    width: '100%',
    height: heightPercentage(220),
    borderRadius: round.md,
    backgroundColor: night.surfaceHigh,
  },
  heroBody: {paddingTop: space.md},
  heroEyebrow: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.xs),
    color: night.accent,
    marginBottom: space.xs,
  },
  heroName: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(fontSize.xl),
    color: night.text,
  },
  heroReason: {
    marginTop: space.xs,
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.sm),
    color: night.textDim,
    lineHeight: fontPercentage(20),
  },

  recommendCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: space.gutter,
    marginTop: space.xxl,
    paddingVertical: space.sm,
  },
  recommendCtaTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.base),
    color: night.accent,
  },
  recommendCtaArrow: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.xl),
    color: night.accent,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: space.gutter,
    marginTop: space.xxl,
    marginBottom: space.md,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(fontSize.lg),
    color: night.text,
  },
  sectionMore: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.sm),
    color: night.textDim,
  },

  newsCard: {
    marginHorizontal: space.gutter,
    marginBottom: space.xxl,
  },
  newsImage: {
    width: '100%',
    height: heightPercentage(170),
    borderRadius: round.md,
    backgroundColor: night.surfaceHigh,
  },
  newsBody: {paddingTop: space.md},
  newsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: space.sm,
  },
  newsCategory: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(fontSize.xs),
    color: night.accent,
  },
  newsDate: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.xs),
    color: night.textFaint,
  },
  newsTitle: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.lg),
    color: night.text,
    lineHeight: fontPercentage(24),
  },
  newsSummary: {
    marginTop: heightPercentage(spacing.sm),
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.sm),
    color: night.textFaint,
    lineHeight: fontPercentage(20),
  },
});
