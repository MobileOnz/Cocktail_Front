import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { fontPercentage } from '../../assets/styles/FigmaScreen';
import instance from '../../tokenRequest/axios_interceptor';
import { unwrap, toUserMessage } from '../../lib/api';
import type { NewsCard, NewsFeedResponse } from '../../types/api';
import ErrorState from '../../Components/common/ErrorState';
import EmptyState from '../../Components/common/EmptyState';
import SkeletonList from '../../Components/common/SkeletonList';
import { formatDate } from '../../lib/date';

const CATEGORIES = [
  { id: 'ALL', label: '최신' },
  { id: 'STORY', label: '스토리' },
  { id: 'MOOD', label: '무드' },
  { id: 'BASE', label: '베이스' },
];

const NewsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [news, setNews] = useState<NewsCard[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await instance.get('/api/v2/magazine', { params: { category: 'STORY' } });
      // 매거진 목록도 뉴스와 동일 봉투 { items, nextCursor } 다. 뉴스 자리는 STORY 만.
      const data = unwrap<NewsFeedResponse>(res);
      setNews(data.items ?? []);
    } catch (e) {
      setError(toUserMessage(e, '뉴스를 불러오지 못했습니다.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  // API 가 오래된 순으로 내려오므로 최신순으로 뒤집어 보여준다.
  const sortedNews = [...news].sort(
    (a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime(),
  );
  const filteredNews = selectedCategory === 'ALL'
    ? sortedNews
    : sortedNews.filter(item => item.category === selectedCategory);

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
        <Text style={styles.newsTitle} lineBreakStrategyIOS="hangul-word" textBreakStrategy="balanced">{item.title}</Text>
        {/* 백엔드에 author 는 없다. 출처는 source. */}
        {!!item.source && <Text style={styles.newsAuthor}>{item.source}</Text>}
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

      {loading ? (
        <SkeletonList count={3} variant="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchNews} />
      ) : (
        <FlatList
          data={filteredNews}
          keyExtractor={item => item.id.toString()}
          renderItem={renderNewsItem}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="해당 카테고리의 뉴스가 없습니다"
              description="다른 카테고리를 살펴보시겠어요?"
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  newsCard: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E9ECEF',
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
    color: '#FF6B00',
    fontFamily: 'Pretendard-Bold',
  },
  newsDate: {
    fontSize: fontPercentage(12),
    color: '#ADB5BD',
  },
  newsTitle: {
    fontSize: fontPercentage(17),
    fontFamily: 'Pretendard-SemiBold',
    color: '#212529',
    marginBottom: 8,
    lineHeight: 24,
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
    fontSize: fontPercentage(15),
  },
});

export default NewsScreen;
