// HomeFeedScreen.tsx (T-21)
// 탭1 홈 — GET /api/v2/main 한 번으로 [추천 히어로 + 뉴스/가이드 인터리브 피드]를 그린다.
// 무한 스크롤(nextCursor) + pull-to-refresh. 이전 CocktailListScreen 의 6개 병렬 호출을 대체.
import React, { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import instance from '../../tokenRequest/axios_interceptor';
import { unwrap, toUserMessage } from '../../lib/api';
import { colors, fonts, fontSize, radius, spacing } from '../../lib/theme';
import type { FeedItem, Hero, MainResponse, NewsCard, NewsFeedResponse } from '../../types/api';
import ErrorState from '../../Components/common/ErrorState';
import EmptyState from '../../Components/common/EmptyState';
import SkeletonList from '../../Components/common/SkeletonList';
import TopRightMenu from '../../Components/common/TopRightMenu';
import { useTabBarSpace } from '../../lib/layout';
import { formatDate } from '../../lib/date';

/** 홈 '인기 레시피' 가로 섹션 카드. 레시피북(칵테일) 내용을 홈 피드에 혼합한다. */
type HomeCocktail = { id: number; korName: string; imageUrl?: string | null };

const PAGE_SIZE = 20;

/** feed 아이템은 news/guide 가 섞이므로 타입+식별자 조합으로 키를 만든다. */
const feedKey = (item: FeedItem): string =>
  item.type === 'news' ? `news-${item.id}` : `guide-${item.part}`;

const HomeFeedScreen = () => {
  const navigation = useNavigation<any>();
  const tabBarSpace = useTabBarSpace();

  const [hero, setHero] = useState<Hero | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  // main.feed 에는 type:'cocktail' 이 없어, 레시피북(칵테일) 내용을 홈에 혼합하기 위해
  // 칵테일 목록을 따로 불러 '인기 레시피' 섹션으로 붙인다. 보조 섹션이라 실패해도 조용히 비운다.
  const [cocktails, setCocktails] = useState<HomeCocktail[]>([]);
  // 추천 CTA와 '인기 레시피' 사이의 '최신 칵테일 뉴스' 가로 하이라이트.
  // /api/v2/main 피드에도 뉴스가 섞이지만, 여기선 최신 N건만 가로로 미리 보여준다.
  // 보조 섹션이라 실패해도 조용히 비운다(홈 본 피드에는 영향 없음).
  const [latestNews, setLatestNews] = useState<NewsCard[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 동시 요청/언마운트 후 setState 방지
  const inFlight = useRef(false);
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  const fetchPage = useCallback(async (nextCursor: string | null, mode: 'initial' | 'refresh' | 'more') => {
    if (inFlight.current) { return; }
    inFlight.current = true;

    if (mode === 'initial') { setLoading(true); setError(null); }
    if (mode === 'refresh') { setRefreshing(true); }
    if (mode === 'more') { setLoadingMore(true); }

    try {
      const res = await instance.get('/api/v2/main', {
        params: { size: PAGE_SIZE, ...(nextCursor ? { cursor: nextCursor } : {}) },
      });
      const data = unwrap<MainResponse>(res);
      if (!mounted.current) { return; }

      setHero(data.hero ?? null);
      setFeed(prev => (mode === 'more' ? [...prev, ...(data.feed ?? [])] : (data.feed ?? [])));
      setCursor(data.nextCursor ?? null);
      setError(null);
    } catch (e) {
      if (!mounted.current) { return; }
      // 더 불러오기 실패는 기존 목록을 지우지 않는다.
      if (mode !== 'more') { setError(toUserMessage(e, '피드를 불러오지 못했습니다.')); }
    } finally {
      inFlight.current = false;
      if (!mounted.current) { return; }
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchPage(null, 'initial'); }, [fetchPage]);

  useEffect(() => {
    let alive = true;
    instance
      .post('/api/v2/cocktails', {}, { params: { page: 0, size: 10, sort: 'korName,asc' } })
      .then(res => {
        const content: HomeCocktail[] = res?.data?.data?.content ?? [];
        if (alive) { setCocktails(content); }
      })
      .catch(() => { /* 홈 보조 섹션 — 실패 시 무시 */ });
    return () => { alive = false; };
  }, []);

  // 최신 칵테일 뉴스 (가로 하이라이트). NewsScreen 과 동일하게 /api/v2/news 를 쓴다.
  // 보조 섹션이라 실패해도 조용히 비운다.
  useEffect(() => {
    let alive = true;
    instance
      .get('/api/v2/news')
      .then(res => {
        const data = unwrap<NewsFeedResponse>(res);
        if (alive) {
          // API 가 오래된 순으로 내려와 '최신' 레일에 가장 오래된 기사가 실리던 문제 —
          // publishedAt 내림차순으로 정렬한 뒤 앞 10건을 쓴다.
          const sorted = [...(data.items ?? [])].sort(
            (a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime(),
          );
          setLatestNews(sorted.slice(0, 10));
        }
      })
      .catch(() => { /* 홈 보조 섹션 — 실패 시 무시 */ });
    return () => { alive = false; };
  }, []);

  const onRefresh = useCallback(() => fetchPage(null, 'refresh'), [fetchPage]);

  const onEndReached = useCallback(() => {
    if (cursor && !loadingMore && !loading && !refreshing) {
      fetchPage(cursor, 'more');
    }
  }, [cursor, loadingMore, loading, refreshing, fetchPage]);

  // '최신 칵테일 뉴스' 가로 레일에 이미 보인 뉴스는 세로 피드에서 뺀다.
  // 같은 기사·같은 썸네일이 한 화면에 두 번 보이던 중복(디자인 리뷰 P2-6) 제거.
  const visibleFeed = useMemo(() => {
    if (latestNews.length === 0) { return feed; }
    const shownNewsIds = new Set(latestNews.map(n => n.id));
    return feed.filter(item => !(item.type === 'news' && shownNewsIds.has(item.id)));
  }, [feed, latestNews]);

  const openNews = useCallback(
    (id: number) => navigation.navigate('NewsDetailScreen', { newsId: id }),
    [navigation],
  );
  const openGuide = useCallback(
    () => navigation.navigate('GuideScreen'),
    [navigation],
  );

  const renderHero = () => {
    if (!hero) { return null; }
    return (
      <TouchableOpacity
        style={styles.heroCard}
        activeOpacity={0.92}
        onPress={() => navigation.navigate('CocktailDetailScreen', { cocktailId: hero.cocktailId })}
        accessibilityRole="button"
        accessibilityLabel={`오늘의 추천 ${hero.name} 상세 보기`}
      >
        {!!hero.imageUrl && (
          <Image source={{ uri: hero.imageUrl }} style={styles.heroImage} resizeMode="cover" />
        )}
        <View style={styles.heroBody}>
          <Text style={styles.heroEyebrow}>오늘의 추천</Text>
          <Text style={styles.heroName}>{hero.name}</Text>
          {/* heroReason 은 서버가 내려주는 추천 근거. 그대로 노출한다. */}
          <Text style={styles.heroReason}>{hero.heroReason}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = (
    <View>
      <View style={styles.appbar}>
        <Text style={styles.brand}>onz</Text>
        <View style={styles.appbarActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('SearchScreen')}
            accessibilityRole="button"
            accessibilityLabel="칵테일 검색"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image
              source={require('../../assets/drawable/SharpSearch.png')}
              style={styles.searchIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          {/* 하단 탭에서 빠진 마이페이지의 새 진입점 */}
          <TopRightMenu tint={colors.text} />
        </View>
      </View>

      {renderHero()}

      <TouchableOpacity
        style={styles.recommendCta}
        onPress={() => navigation.navigate('RecommendationIntro')}
        accessibilityRole="button"
        accessibilityLabel="나에게 맞는 칵테일 추천 받기"
      >
        <Text style={styles.recommendCtaText}>나에게 맞는 칵테일 추천 받기</Text>
        <Text style={styles.recommendCtaArrow}>›</Text>
      </TouchableOpacity>

      {latestNews.length > 0 && (
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최신 칵테일 뉴스</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('NewsScreen')}
              accessibilityRole="button"
              accessibilityLabel="최신 칵테일 뉴스 전체보기"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.sectionMore}>전체보기</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cocktailRow}
          >
            {latestNews.map(n => (
              <TouchableOpacity
                key={`latest-news-${n.id}`}
                style={styles.newsHCard}
                activeOpacity={0.9}
                onPress={() => openNews(n.id)}
                accessibilityRole="button"
                accessibilityLabel={`뉴스 ${n.title} 열기`}
              >
                {!!n.imageUrl && (
                  <Image source={{ uri: n.imageUrl }} style={styles.newsHImage} resizeMode="cover" />
                )}
                <Text style={styles.newsHCategory} numberOfLines={1}>{n.categoryLabel ?? '뉴스'}</Text>
                <Text style={styles.newsHTitle} numberOfLines={2} lineBreakStrategyIOS="hangul-word" textBreakStrategy="balanced">{n.title}</Text>
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
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.sectionMore}>전체보기</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cocktailRow}
          >
            {cocktails.map(c => (
              <TouchableOpacity
                key={`cocktail-${c.id}`}
                style={styles.cocktailCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('CocktailDetailScreen', { cocktailId: c.id })}
                accessibilityRole="button"
                accessibilityLabel={`레시피 ${c.korName} 상세 보기`}
              >
                {!!c.imageUrl && (
                  <Image source={{ uri: c.imageUrl }} style={styles.cocktailImage} resizeMode="cover" />
                )}
                <Text style={styles.cocktailName} numberOfLines={1}>{c.korName}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {visibleFeed.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>지금 읽어볼 이야기</Text>
          {/* 전체 뉴스 목록(NewsScreen)의 유일한 진입점. 없애면 카테고리 필터에 도달할 수 없다. */}
          <TouchableOpacity
            onPress={() => navigation.navigate('NewsScreen')}
            accessibilityRole="button"
            accessibilityLabel="칵테일 뉴스 전체보기"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.sectionMore}>전체보기</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderItem = ({ item }: { item: FeedItem }) => {
    if (item.type === 'guide') {
      // 가이드 진입점 ② — 홈 피드 인터리브
      return (
        <TouchableOpacity
          style={styles.guideCard}
          activeOpacity={0.92}
          onPress={openGuide}
          accessibilityRole="button"
          accessibilityLabel={`가이드 ${item.title} 열기`}
        >
          {!!item.imageUrl && (
            <Image source={{ uri: item.imageUrl }} style={styles.guideImage} resizeMode="cover" />
          )}
          <View style={styles.guideBody}>
            <Text style={styles.guideBadge}>가이드 · Part {item.part}</Text>
            <Text style={styles.guideTitle} numberOfLines={2} lineBreakStrategyIOS="hangul-word" textBreakStrategy="balanced">{item.title}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.newsCard}
        activeOpacity={0.92}
        onPress={() => openNews(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`뉴스 ${item.title} 열기`}
      >
        {/* imageUrl 은 서버가 null 이면 키째로 생략한다(NON_NULL). 없으면 이미지 영역을 아예 안 그린다. */}
        {!!item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.newsImage} resizeMode="cover" />
        )}
        <View style={styles.newsBody}>
          <View style={styles.newsMeta}>
            {/* 라벨은 서버(categoryLabel) 것을 쓴다. 프론트 하드코딩 매핑 제거. */}
            <Text style={styles.newsCategory}>{item.categoryLabel ?? '뉴스'}</Text>
            <Text style={styles.newsDate}>{formatDate(item.publishedAt)}</Text>
          </View>
          <Text style={styles.newsTitle} numberOfLines={2} lineBreakStrategyIOS="hangul-word" textBreakStrategy="balanced">{item.title}</Text>
          {!!item.summary && (
            <Text style={styles.newsSummary} numberOfLines={2}>{item.summary}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // 초기 로딩: 스켈레톤
  if (loading && feed.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        <View style={styles.appbar}>
          <Text style={styles.brand}>onz</Text>
          <TopRightMenu tint={colors.text} />
        </View>
        <SkeletonList count={3} variant="card" />
      </SafeAreaView>
    );
  }

  // 초기 로딩 실패: 전면 에러 + 재시도
  if (error && feed.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        <View style={styles.appbar}>
          <Text style={styles.brand}>onz</Text>
          <TopRightMenu tint={colors.text} />
        </View>
        <ErrorState message={error} onRetry={() => fetchPage(null, 'initial')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <FlatList
        data={visibleFeed}
        keyExtractor={feedKey}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            title="아직 보여드릴 이야기가 없어요"
            description="곧 새로운 뉴스와 가이드로 찾아올게요."
            actionLabel="새로고침"
            onAction={onRefresh}
          />
        }
        ListFooterComponent={
          <View>
            {loadingMore && (
              <ActivityIndicator
                size="small"
                color={colors.accent}
                style={{ marginVertical: heightPercentage(spacing.xl) }}
              />
            )}
          </View>
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: tabBarSpace }]}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
};

export default HomeFeedScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  listContent: {},

  appbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: widthPercentage(spacing.xl),
    paddingTop: heightPercentage(spacing.sm),
    paddingBottom: heightPercentage(spacing.md),
  },
  brand: { fontFamily: fonts.bold, fontSize: fontPercentage(fontSize.hero), color: colors.text },
  appbarActions: { flexDirection: 'row', alignItems: 'center', gap: widthPercentage(spacing.md) },
  searchIcon: { width: widthPercentage(22), height: widthPercentage(22) },

  cocktailRow: {
    paddingHorizontal: widthPercentage(spacing.lg),
    paddingVertical: heightPercentage(spacing.xs),
    gap: widthPercentage(spacing.md),
  },
  cocktailCard: { width: widthPercentage(120) },
  cocktailImage: {
    width: widthPercentage(120),
    height: widthPercentage(120),
    borderRadius: radius.md,
    backgroundColor: colors.skeleton,
    marginBottom: heightPercentage(spacing.sm),
  },
  cocktailName: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.text,
  },

  // 최신 칵테일 뉴스 가로 카드 — 뉴스는 제목이 길어 레시피 카드보다 넓게 둔다.
  newsHCard: { width: widthPercentage(200) },
  newsHImage: {
    width: widthPercentage(200),
    height: widthPercentage(112),
    borderRadius: radius.md,
    backgroundColor: colors.skeleton,
    marginBottom: heightPercentage(spacing.sm),
  },
  newsHCategory: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(fontSize.xs),
    color: colors.accent,
    marginBottom: heightPercentage(spacing.xs),
  },
  newsHTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.text,
    lineHeight: fontPercentage(18),
  },

  heroCard: {
    marginHorizontal: widthPercentage(spacing.lg),
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.bgMuted,
  },
  heroImage: { width: '100%', height: heightPercentage(220), backgroundColor: colors.skeleton },
  heroBody: { padding: widthPercentage(spacing.lg) },
  heroEyebrow: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.xs),
    color: colors.accent,
    marginBottom: heightPercentage(spacing.xs),
  },
  heroName: { fontFamily: fonts.bold, fontSize: fontPercentage(fontSize.xl), color: colors.text },
  heroReason: {
    marginTop: heightPercentage(spacing.xs + 2),
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.textSecondary,
    lineHeight: fontPercentage(20),
  },

  recommendCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: widthPercentage(spacing.lg),
    marginTop: heightPercentage(spacing.lg),
    paddingHorizontal: widthPercentage(spacing.lg),
    paddingVertical: heightPercentage(spacing.lg),
    borderRadius: radius.md,
    backgroundColor: colors.bgInverse,
  },
  recommendCtaText: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.base),
    color: colors.textInverse,
  },
  recommendCtaArrow: { fontSize: fontPercentage(fontSize.xl), color: colors.textInverse },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: widthPercentage(spacing.lg),
    marginTop: heightPercentage(spacing.xxl),
    marginBottom: heightPercentage(spacing.md),
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(fontSize.lg),
    color: colors.text,
  },
  sectionMore: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.textTertiary,
  },

  newsCard: {
    marginHorizontal: widthPercentage(spacing.lg),
    marginBottom: heightPercentage(spacing.lg),
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  newsImage: { width: '100%', height: heightPercentage(170), backgroundColor: colors.skeleton },
  newsBody: { padding: widthPercentage(spacing.lg) },
  newsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: heightPercentage(spacing.sm),
  },
  newsCategory: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(fontSize.xs),
    color: colors.accent,
  },
  newsDate: { fontFamily: fonts.regular, fontSize: fontPercentage(fontSize.xs), color: colors.textDisabled },
  newsTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.lg),
    color: colors.text,
    lineHeight: fontPercentage(24),
  },
  newsSummary: {
    marginTop: heightPercentage(spacing.sm),
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.textTertiary,
    lineHeight: fontPercentage(20),
  },

  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: widthPercentage(spacing.lg),
    marginBottom: heightPercentage(spacing.lg),
    padding: widthPercentage(spacing.md),
    borderRadius: radius.lg,
    backgroundColor: colors.bgSubtle,
  },
  guideImage: {
    width: widthPercentage(72),
    height: widthPercentage(72),
    borderRadius: radius.md,
    backgroundColor: colors.skeleton,
    marginRight: widthPercentage(spacing.md),
  },
  guideBody: { flex: 1 },
  guideBadge: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.xs),
    color: colors.textSecondary,
    marginBottom: heightPercentage(spacing.xs),
  },
  guideTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.base),
    color: colors.text,
    lineHeight: fontPercentage(21),
  },
});
