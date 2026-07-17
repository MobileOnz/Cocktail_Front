// src/Screens/Bar/VisitedBarsScreen.tsx
//
// 마이페이지 → 방문한 바. 커서 페이지네이션으로 /api/v2/me/visits 조회.

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import instance from '../../tokenRequest/axios_interceptor';

interface VisitItem {
  id: number;
  visitedAt: string;
  bar: { id: number; slug: string; nameKo: string };
}

const PAGE_SIZE = 20;

const VisitedBarsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<VisitItem[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reachedEnd, setReachedEnd] = useState(false);

  const fetchPage = useCallback(async (next: number | null, replace: boolean) => {
    setError(null);
    if (replace) {
      setLoading(true);
    }
    try {
      const params: any = { limit: PAGE_SIZE };
      if (next !== null) {
        params.cursor = next;
      }
      const qs = new URLSearchParams(params).toString();
      const res = await instance.get(`/api/v2/me/visits?${qs}`);
      const data = res.data?.data ?? {};
      const list = (data.items ?? []) as VisitItem[];
      const nextCursor = data.nextCursor ?? null;
      setItems(prev => (replace ? list : [...prev, ...list]));
      setCursor(nextCursor);
      setReachedEnd(nextCursor === null);
    } catch (e: any) {
      console.warn('[VisitedBars] fetch error', e?.message ?? e);
      setError(e?.response?.data?.msg ?? '방문한 바를 불러오지 못했습니다');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(null, true);
  }, [fetchPage]);

  const onRefresh = () => {
    setRefreshing(true);
    setReachedEnd(false);
    fetchPage(null, true);
  };

  const onEndReached = () => {
    if (loading || refreshing || reachedEnd || cursor === null) {
      return;
    }
    fetchPage(cursor, false);
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      const y = d.getFullYear();
      const m = `${d.getMonth() + 1}`.padStart(2, '0');
      const day = `${d.getDate()}`.padStart(2, '0');
      return `${y}.${m}.${day}`;
    } catch {
      return '';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>방문한 바</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && items.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 24 }} color="#1B1B1B" />
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchPage(null, true)}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>아직 방문한 바가 없습니다</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          data={items}
          keyExtractor={item => String(item.id)}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            !reachedEnd && cursor !== null ? (
              <ActivityIndicator style={{ paddingVertical: 16 }} color="#1B1B1B" />
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate('BarDetailScreen', { slug: item.bar.slug })}>
              <Text style={styles.rowName}>{item.bar.nameKo}</Text>
              <Text style={styles.rowMeta}>{formatDate(item.visitedAt)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backArrow: { color: '#1B1B1B', fontSize: 22 },
  title: { color: '#1B1B1B', fontSize: 18, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  rowName: { color: '#1B1B1B', fontSize: 16, fontWeight: '500', flex: 1 },
  rowMeta: { color: '#9E9E9E', fontSize: 13 },
  separator: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 20 },
  empty: { padding: 48, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 14 },
  retryBtn: { marginTop: 16, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#222', borderRadius: 8 },
  retryText: { color: '#FFFFFF', fontSize: 13 },
});

export default VisitedBarsScreen;
