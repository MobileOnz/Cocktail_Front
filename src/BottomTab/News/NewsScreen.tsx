import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  fontPercentage,
  heightPercentage,
} from '../../assets/styles/FigmaScreen';
import instance from '../../tokenRequest/axios_interceptor';
import {unwrap, toUserMessage} from '../../lib/api';
import type {NewsCard, NewsFeedResponse} from '../../types/api';
import ErrorState from '../../Components/common/ErrorState';
import EmptyState from '../../Components/common/EmptyState';
import RemoteImage from '../../Components/common/RemoteImage';
import SkeletonList from '../../Components/common/SkeletonList';
import {formatDate} from '../../lib/date';
import {fonts, night, round, space} from '../../lib/theme';

/** 서버 기본값과 맞춘다(BE: MagazineService.DEFAULT_SIZE). */
const PAGE_SIZE = 20;

const CATEGORIES = [
  {id: 'ALL', label: '전체'},
  {id: 'STORY', label: '스토리'},
  {id: 'GUIDE', label: '가이드'},
];

const NewsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [news, setNews] = useState<NewsCard[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  // QA: "매거진 해시태그를 검색·필터링에 쓸 수 있으면 좋겠다" → 상단 칩으로 노출한다.
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(
    route.params?.tag ?? null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // null = 아직 안 불러옴, undefined 로 두지 않는다. 마지막 페이지면 서버가 null 을 준다.
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  // 카테고리를 바꾸면 이전 카테고리로 나갔던 요청의 응답이 뒤늦게 도착할 수 있다.
  // 세대 번호를 붙여, 지금 보고 있는 카테고리의 응답이 아니면 버린다.
  // (없으면 '스토리' 탭에 '가이드' 글이 섞이고 커서까지 남의 것으로 덮인다)
  const generation = useRef(0);
  const tagRef = useRef<string | null>(null);
  /**
   * 매거진 목록.
   *
   * 예전엔 전량을 받아 클라이언트에서 정렬·필터했다. 글이 늘수록 첫 진입이 느려지는 구조라
   * 서버 커서 페이지네이션으로 옮겼다. 정렬(최신순)과 카테고리 필터도 서버가 한다.
   */
  const fetchPage = useCallback(
    async (category: string, tag: string | null, cursor: string | null) => {
      const res = await instance.get('/api/v2/magazine', {
        params: {
          category,
          size: PAGE_SIZE,
          ...(tag ? {tag} : {}),
          ...(cursor ? {cursor} : {}),
        },
      });
      return unwrap<NewsFeedResponse>(res);
    },
    [],
  );

  const loadFirstPage = useCallback(
    async (category: string) => {
      const gen = ++generation.current;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPage(category, tagRef.current, null);
        if (gen !== generation.current) {
          return;
        }
        setNews(data.items ?? []);
        setNextCursor(data.nextCursor ?? null);
      } catch (e) {
        if (gen !== generation.current) {
          return;
        }
        setError(toUserMessage(e, '매거진을 불러오지 못했습니다.'));
        setNews([]);
        setNextCursor(null);
      } finally {
        if (gen === generation.current) {
          setLoading(false);
        }
      }
    },
    [fetchPage],
  );

  const loadMore = useCallback(async () => {
    // nextCursor 가 null 이면 마지막 페이지다. loadingMore 가드가 없으면
    // onEndReached 가 스크롤 한 번에 여러 번 불려 같은 페이지를 중복으로 붙인다.
    if (!nextCursor || loadingMore || loading) {
      return;
    }
    const gen = generation.current;
    setLoadingMore(true);
    try {
      const data = await fetchPage(selectedCategory, selectedTag, nextCursor);
      // 응답이 오는 사이 카테고리가 바뀌었으면 이 페이지는 남의 것이다.
      if (gen !== generation.current) {
        return;
      }
      setNews(prev => [...prev, ...(data.items ?? [])]);
      setNextCursor(data.nextCursor ?? null);
    } catch {
      // 다음 페이지 실패는 이미 보고 있는 목록을 지울 이유가 없다. 커서만 멈춘다.
      if (gen === generation.current) {
        setNextCursor(null);
      }
    } finally {
      if (gen === generation.current) {
        setLoadingMore(false);
      }
    }
  }, [
    nextCursor,
    loadingMore,
    loading,
    selectedCategory,
    selectedTag,
    fetchPage,
  ]);

  useEffect(() => {
    instance
      .get('/api/v2/magazine/tags')
      .then(res => setTags(unwrap<string[]>(res) ?? []))
      .catch(() => setTags([])); // 태그는 부가 기능이다. 실패해도 목록은 보여야 한다.
  }, []);

  // 상세에서 태그를 눌러 들어오면 그 태그로 걸러 보여준다.
  // 파라미터가 '새로 온 값'일 때만 반영한다 — selectedTag 를 의존성에 넣으면
  // 사용자가 칩으로 태그를 바꾼 직후 라우트 파라미터가 그걸 도로 덮어쓴다.
  const appliedRouteTag = useRef<string | null | undefined>(route.params?.tag);
  useEffect(() => {
    const t = route.params?.tag ?? null;
    if (t !== appliedRouteTag.current) {
      appliedRouteTag.current = t;
      setSelectedTag(t);
    }
  }, [route.params?.tag]);

  useEffect(() => {
    tagRef.current = selectedTag;
    loadFirstPage(selectedCategory);
  }, [selectedCategory, selectedTag, loadFirstPage]);

  const fetchNews = useCallback(
    () => loadFirstPage(selectedCategory),
    [loadFirstPage, selectedCategory],
  );

  const renderNewsItem = ({item}: {item: NewsCard}) => (
    <TouchableOpacity
      style={styles.newsCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('NewsDetailScreen', {newsId: item.id})}
      accessibilityRole="button"
      accessibilityLabel={`${item.title} 뉴스 열기`}>
      {/* 맨 Image 였을 땐 로딩 동안 그냥 빈칸이라 "사진이 느리게 뜬다"로 읽혔다.
          RemoteImage 는 같은 크기로 로딩 펄스 → 실패 시 '이미지 준비중' 까지 그린다.
          imageUrl 이 null 이어도 영역을 유지해 목록 높이가 흔들리지 않는다. */}
      {!!item.imageUrl && (
        <RemoteImage
          uri={item.imageUrl}
          style={styles.newsImage}
          resizeMode="cover"
          tone="dark"
          label={item.title}
          accessibilityLabel={`${item.title} 이미지`}
        />
      )}
      <View style={styles.newsContent}>
        <View style={styles.newsMeta}>
          {/* 라벨은 서버가 내려주는 categoryLabel 을 쓴다(프론트 하드코딩 매핑 제거). */}
          <Text style={styles.newsCategoryText}>{item.categoryLabel}</Text>
          <Text style={styles.newsDate}>{formatDate(item.publishedAt)}</Text>
        </View>
        {/* source 는 전 건이 'onz 에디터' 라 카드에서 변별력이 0 이었다 → 요약으로 교체.
            요약이 비면(가이드 유래 글) 제목을 3줄까지 풀어 카드 높이를 벌충한다. */}
        <Text
          style={styles.newsTitle}
          numberOfLines={item.summary ? 2 : 3}
          lineBreakStrategyIOS="hangul-word"
          textBreakStrategy="balanced">
          {item.title}
        </Text>
        {!!item.summary && (
          <Text
            style={styles.newsSummary}
            numberOfLines={2}
            lineBreakStrategyIOS="hangul-word"
            textBreakStrategy="balanced">
            {item.summary}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // 태그 바는 리스트의 헤더로 들어간다.
  //
  // 예전엔 스크롤량에 맞춰 height 를 애니메이션해 접었는데, 높이 변화가 리스트 오프셋을
  // 바꾸고 그 오프셋이 다시 높이를 바꾸는 되먹임이 생겨 최하단에서 화면이 떨렸다
  // (QA: "맨 마지막까지 스크롤하면 부르르르 떨린다").
  // 헤더로 넣으면 콘텐츠와 함께 자연스럽게 밀려 올라가므로 애니메이션도, 되먹임도 없다.
  // (대신 목록 중간에서 살짝 올려 다시 펼치는 동작은 사라진다 — 맨 위로 가면 다시 보인다.)
  const tagBar =
    tags.length > 0 ? (
      <View style={styles.tagBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagBarContent}>
          {tags.map(t => {
            const on = selectedTag === t;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.tagChip, on && styles.tagChipActive]}
                onPress={() => setSelectedTag(on ? null : t)}
                accessibilityRole="button"
                accessibilityState={{selected: on}}
                accessibilityLabel={`${t} 태그 ${on ? '해제' : '적용'}`}>
                <Text
                  style={[styles.tagChipText, on && styles.tagChipTextActive]}>
                  #{t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    ) : null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 10}]}>
        <Text style={styles.headerTitle}>매거진</Text>
      </View>

      <View style={styles.tabBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.tabItem,
                selectedCategory === cat.id && styles.tabItemActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}>
              <Text
                style={[
                  styles.tabLabel,
                  selectedCategory === cat.id && styles.tabLabelActive,
                ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <SkeletonList count={3} variant="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchNews} />
      ) : (
        <FlatList
          data={news}
          ListHeaderComponent={tagBar}
          keyExtractor={item => item.id.toString()}
          renderItem={renderNewsItem}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: insets.bottom + 120},
          ]}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={styles.footerSpinner} />
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              title={
                selectedTag
                  ? `#${selectedTag} 글이 없습니다`
                  : '해당 카테고리의 글이 없습니다'
              }
              description={
                selectedTag
                  ? '태그를 해제하거나 다른 태그를 골라보세요.'
                  : '다른 카테고리를 살펴보시겠어요?'
              }
              emoji="📰"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: night.ink,
  },
  header: {
    paddingHorizontal: space.gutter,
    paddingBottom: space.md,
  },
  headerTitle: {
    fontSize: fontPercentage(24),
    fontFamily: fonts.bold,
    color: night.text,
  },

  // 전체 / 스토리 / 가이드 — 하나만 고르는 세그먼트다.
  // 예전엔 셋 다 회색 알약에 흰 바 아래 실선까지 있어 선이 두 겹으로 겹쳤다.
  // 고른 것만 채우고 나머지는 글자만 둔다. 무엇이 켜졌는지는 채움이 말한다.
  tabBar: {
    zIndex: 3,
  },
  tabBarContent: {
    paddingHorizontal: space.gutter,
    paddingVertical: space.sm,
    columnGap: space.xs,
  },
  tabItem: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: round.pill,
  },
  tabItemActive: {
    backgroundColor: night.accent,
  },
  tabLabel: {
    fontSize: fontPercentage(14),
    fontFamily: fonts.medium,
    color: night.textDim,
  },
  tabLabelActive: {
    color: night.onAccent,
  },

  // 태그는 껐다 켰다 하는 토글이라 눌리는 것임을 형태로 알려야 한다.
  // 레시피북의 필터 칩과 같은 말을 쓴다(표면색 + 얇은 선).
  tagBar: {
    paddingBottom: space.sm,
  },
  tagBarContent: {
    paddingHorizontal: space.gutter,
    paddingBottom: space.md,
    columnGap: space.sm,
  },
  tagChip: {
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: round.pill,
    borderWidth: 1,
    borderColor: night.line,
    backgroundColor: night.surface,
  },
  tagChipActive: {
    backgroundColor: night.accent,
    borderColor: night.accent,
  },
  tagChipText: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(13),
    color: night.textDim,
  },
  tagChipTextActive: {
    color: night.onAccent,
  },

  footerSpinner: {
    paddingVertical: space.xl,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // 테두리가 있던 이유는 카드(#FFFFFF)와 배경(#F8F9FA)의 명도차가 2% 뿐이라
  // 선이 없으면 경계가 사라졌기 때문이다. 배경이 검어진 지금은 그 이유가 없다 —
  // 사진의 둥근 모서리가 곧 카드 모양이고, 글은 배경 위에 그대로 앉는다.
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
  newsContent: {
    paddingTop: space.md,
  },
  newsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.sm,
  },
  newsCategoryText: {
    fontSize: fontPercentage(12),
    color: night.accent,
    fontFamily: fonts.bold,
  },
  newsDate: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(12),
    color: night.textFaint,
  },
  newsTitle: {
    fontSize: fontPercentage(17),
    fontFamily: fonts.semibold,
    color: night.text,
    marginBottom: space.sm,
    lineHeight: fontPercentage(24),
  },
  newsSummary: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: fontPercentage(14),
    lineHeight: fontPercentage(21),
    color: night.textDim,
  },
});

export default NewsScreen;
