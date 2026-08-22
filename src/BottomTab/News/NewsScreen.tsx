import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fontPercentage, heightPercentage } from '../../assets/styles/FigmaScreen';
import instance from '../../tokenRequest/axios_interceptor';
import { unwrap, toUserMessage } from '../../lib/api';
import type { NewsCard, NewsFeedResponse } from '../../types/api';
import ErrorState from '../../Components/common/ErrorState';
import EmptyState from '../../Components/common/EmptyState';
import SkeletonList from '../../Components/common/SkeletonList';
import { formatDate } from '../../lib/date';
import { colors, fonts, radius } from '../../lib/theme';

/** 서버 기본값과 맞춘다(BE: MagazineService.DEFAULT_SIZE). */
const PAGE_SIZE = 20;

const CATEGORIES = [
  { id: 'ALL', label: '전체' },
  { id: 'STORY', label: '스토리' },
  { id: 'GUIDE', label: '가이드' },
];

const NewsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [news, setNews] = useState<NewsCard[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  // QA: "매거진 해시태그를 검색·필터링에 쓸 수 있으면 좋겠다" → 상단 칩으로 노출한다.
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(route.params?.tag ?? null);
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
  const fetchPage = useCallback(async (category: string, tag: string | null, cursor: string | null) => {
    const res = await instance.get('/api/v2/magazine', {
      params: {
        category,
        size: PAGE_SIZE,
        ...(tag ? { tag } : {}),
        ...(cursor ? { cursor } : {}),
      },
    });
    return unwrap<NewsFeedResponse>(res);
  }, []);

  const loadFirstPage = useCallback(async (category: string) => {
    const gen = ++generation.current;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPage(category, tagRef.current, null);
      if (gen !== generation.current) { return; }
      setNews(data.items ?? []);
      setNextCursor(data.nextCursor ?? null);
    } catch (e) {
      if (gen !== generation.current) { return; }
      setError(toUserMessage(e, '매거진을 불러오지 못했습니다.'));
      setNews([]);
      setNextCursor(null);
    } finally {
      if (gen === generation.current) { setLoading(false); }
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    // nextCursor 가 null 이면 마지막 페이지다. loadingMore 가드가 없으면
    // onEndReached 가 스크롤 한 번에 여러 번 불려 같은 페이지를 중복으로 붙인다.
    if (!nextCursor || loadingMore || loading) { return; }
    const gen = generation.current;
    setLoadingMore(true);
    try {
      const data = await fetchPage(selectedCategory, selectedTag, nextCursor);
      // 응답이 오는 사이 카테고리가 바뀌었으면 이 페이지는 남의 것이다.
      if (gen !== generation.current) { return; }
      setNews(prev => [...prev, ...(data.items ?? [])]);
      setNextCursor(data.nextCursor ?? null);
    } catch {
      // 다음 페이지 실패는 이미 보고 있는 목록을 지울 이유가 없다. 커서만 멈춘다.
      if (gen === generation.current) { setNextCursor(null); }
    } finally {
      if (gen === generation.current) { setLoadingMore(false); }
    }
  }, [nextCursor, loadingMore, loading, selectedCategory, selectedTag, fetchPage]);

  useEffect(() => {
    instance.get('/api/v2/magazine/tags')
      .then(res => setTags(unwrap<string[]>(res) ?? []))
      .catch(() => setTags([]));   // 태그는 부가 기능이다. 실패해도 목록은 보여야 한다.
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

  const fetchNews = useCallback(() => loadFirstPage(selectedCategory), [loadFirstPage, selectedCategory]);

  const renderNewsItem = ({ item }: { item: NewsCard }) => (
    <TouchableOpacity
      style={styles.newsCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('NewsDetailScreen', { newsId: item.id })}
      accessibilityRole="button"
      accessibilityLabel={`${item.title} 뉴스 열기`}
    >
      {/* imageUrl 은 null 일 수 있다. 외부 Unsplash 폴백 대신 이미지 영역을 생략한다. */}
      {!!item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />
      )}
      <View style={styles.newsContent}>
        <View style={styles.newsMeta}>
          {/* 라벨은 서버가 내려주는 categoryLabel 을 쓴다(프론트 하드코딩 매핑 제거). */}
          <Text style={styles.newsCategoryText}>{item.categoryLabel}</Text>
          <Text style={styles.newsDate}>
            {formatDate(item.publishedAt)}
          </Text>
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

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>매거진</Text>
      </View>

      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.tabItem, selectedCategory === cat.id && styles.tabItemActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[styles.tabLabel, selectedCategory === cat.id && styles.tabLabelActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {tags.length > 0 && (
        <View style={styles.tagBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagBarContent}>
            {tags.map(t => {
              const on = selectedTag === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.tagChip, on && styles.tagChipActive]}
                  onPress={() => setSelectedTag(on ? null : t)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${t} 태그 ${on ? '해제' : '적용'}`}
                >
                  <Text style={[styles.tagChipText, on && styles.tagChipTextActive]}>#{t}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <SkeletonList count={3} variant="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchNews} />
      ) : (
        <FlatList
          data={news}
          keyExtractor={item => item.id.toString()}
          renderItem={renderNewsItem}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={styles.footerSpinner} /> : null
          }
          ListEmptyComponent={
            <EmptyState
              title={selectedTag ? `#${selectedTag} 글이 없습니다` : '해당 카테고리의 글이 없습니다'}
              description={selectedTag ? '태그를 해제하거나 다른 태그를 골라보세요.' : '다른 카테고리를 살펴보시겠어요?'}
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: fontPercentage(22),
    fontFamily: 'Pretendard-Bold',
    color: '#000',
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  tabBarContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F1F3F5',
  },
  tabItemActive: {
    backgroundColor: '#000',
  },
  tabLabel: {
    fontSize: fontPercentage(14),
    fontFamily: 'Pretendard-Medium',
    color: '#495057',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  tagBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tagBarContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    columnGap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  tagChipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  tagChipText: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(13),
    color: colors.textSecondary,
  },
  tagChipTextActive: {
    color: colors.textInverse,
  },
  footerSpinner: {
    paddingVertical: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  // iOS 에서 overflow:'hidden' 은 masksToBounds 라 그림자를 통째로 잘라낸다.
  // 그림자가 안 보이면 카드(#FFFFFF)와 배경(#F8F9FA)의 명도차가 2% 뿐이라 경계가 사라진다.
  // 썸네일이 거의 없는 현재 데이터에선 그림자보다 테두리가 정직하다.
  newsCard: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  // QA: 풀블리드가 답답하다 → 카드 안쪽으로 물리고 모서리를 둥글린다.
  newsImage: {
    marginHorizontal: 12,
    marginTop: 12,
    width: undefined,
    height: heightPercentage(170),
    borderRadius: radius.md,
    backgroundColor: colors.skeleton,
  },
  newsContent: {
    padding: 16,
  },
  newsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsCategoryText: {
    fontSize: fontPercentage(12),
    color: colors.accentText,
    fontFamily: 'Pretendard-Bold',
  },
  newsDate: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(12),
    color: '#ADB5BD',
  },
  newsTitle: {
    fontSize: fontPercentage(17),
    fontFamily: 'Pretendard-Medium',
    color: '#212529',
    marginBottom: 8,
    lineHeight: 24,
  },
  newsSummary: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: fontPercentage(14),
    lineHeight: fontPercentage(21),
    color: colors.textSecondary,
  },
  newsAuthor: {
    fontSize: fontPercentage(13),
    color: '#868E96',
    fontFamily: 'Pretendard-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#ADB5BD',
    fontFamily: fonts.regular,
    fontSize: fontPercentage(15),
  },
});

export default NewsScreen;
