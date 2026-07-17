// src/BottomTab/Bar/BarListScreen.tsx
//
// 바 리스트 — Recommend 탭을 대체. 3 정렬(내 주변/큐레이션/최근).
// 카드는 가게명 + 거리(또는 큐레이션 가중치/최근 일자)만 (Spec D22).
// 진입은 BarDetailScreen.

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  PermissionsAndroid,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTabBarSpace } from '../../lib/layout';
import Geolocation from 'react-native-geolocation-service';
import ErrorState from '../../Components/common/ErrorState';
import EmptyState from '../../Components/common/EmptyState';
import SkeletonList from '../../Components/common/SkeletonList';
import instance from '../../tokenRequest/axios_interceptor';

type Sort = 'curated' | 'distance' | 'recent';

interface BarListItem {
  id: number;
  slug: string;
  nameKo: string;
  nameEn?: string | null;
  distanceKm?: number;
  featuredWeight?: number;
  updatedAt?: string;
}

/** '내 주변' 검색 반경. 백엔드 기본값(3km)보다 넉넉히 잡아 결과가 비지 않게 한다. */
const NEARBY_RADIUS_M = 10000;

async function ensureLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  // iOS: requestAuthorization는 Promise를 반환 — await해서 권한 다이얼로그 응답까지 대기.
  const result = await Geolocation.requestAuthorization('whenInUse');
  return result === 'granted';
}

function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  });
}

const BarListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const navigation = useNavigation<any>();
  const [sort, setSort] = useState<Sort>('curated');
  const [bars, setBars] = useState<BarListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBars = useCallback(async (s: Sort) => {
    setError(null);
    setLoading(true);
    try {
      // '내 주변'만 별도 엔드포인트를 쓴다. 백엔드가 거리순으로 정렬하고 distanceKm 를 채워준다.
      // 권한/좌표 실패는 목록 실패와 다른 사고다 — 사용자가 할 일이 다르므로 문구를 나눈다.
      if (s === 'distance') {
        const granted = await ensureLocationPermission();
        if (!granted) {
          setBars([]);
          setError('위치 권한이 필요합니다.\n설정에서 위치 접근을 허용하면 가까운 바부터 보여드려요.');
          return;
        }
        let coords: { lat: number; lng: number };
        try {
          coords = await getCurrentPosition();
        } catch {
          setBars([]);
          setError('현재 위치를 찾지 못했어요.\n실내이거나 GPS 신호가 약할 수 있어요.');
          return;
        }
        const res = await instance.get('/api/v2/bars/nearby', {
          params: { lat: coords.lat, lng: coords.lng, radiusM: NEARBY_RADIUS_M, limit: 30 },
        });
        setBars((res.data?.data ?? []) as BarListItem[]);
        return;
      }

      const res = await instance.get(`/api/v2/bars?sort=${s}&limit=30`);
      setBars((res.data?.data ?? []) as BarListItem[]);
    } catch (e: any) {
      console.warn('[BarList] fetch error', e?.message ?? e);
      setError(e?.response?.data?.msg ?? '바 목록을 불러오지 못했습니다');
      setBars([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBars(sort);
  }, [sort, fetchBars]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBars(sort);
  };

  const renderRight = (item: BarListItem) => {
    // 거리는 정렬과 무관하게, 서버가 줬으면 보여준다. 1km 미만은 m 가 훨씬 잘 읽힌다.
    if (typeof item.distanceKm === 'number') {
      return item.distanceKm < 1
        ? `${Math.round(item.distanceKm * 1000)}m`
        : `${item.distanceKm.toFixed(1)}km`;
    }
    if (sort === 'recent' && item.updatedAt) {
      try {
        const d = new Date(item.updatedAt);
        const days = Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
        return days === 0 ? '오늘' : `${days}일전`;
      } catch {
        return '';
      }
    }
    return '';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      {/* 검정 배경 화면 — 시계/배터리가 검정 글씨면 보이지 않는다 (I-13).
          스택으로 push 되는 바 상세도 검정 배경이라 이 설정이 그대로 유지된다. */}
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Text style={styles.title}>바</Text>

      <View style={styles.segmentBar}>
        {(['curated', 'distance', 'recent'] as Sort[]).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.segment, sort === s && styles.segmentActive]}
            onPress={() => setSort(s)}>
            <Text style={[styles.segmentText, sort === s && styles.segmentTextActive]}>
              {s === 'curated' ? '큐레이션' : s === 'distance' ? '내 주변' : '최근'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && bars.length === 0 ? (
        <SkeletonList count={5} variant="row" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchBars(sort)} tone="dark" />
      ) : bars.length === 0 ? (
        <EmptyState
          title={sort === 'distance' ? '근처에 등록된 바가 없어요' : '등록된 바가 없습니다'}
          description={
            sort === 'distance'
              ? `${NEARBY_RADIUS_M / 1000}km 안에서 찾지 못했어요. 큐레이션 탭을 둘러보세요.`
              : '조금 뒤에 다시 확인해주세요.'
          }
          emoji="📍"
          tone="dark"
        />
      ) : (
        <FlatList
          contentContainerStyle={{ paddingBottom: tabBarSpace }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />}
          data={bars}
          keyExtractor={(item) => String(item.id)}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate('BarDetailScreen', { slug: item.slug })}>
              <Text style={styles.rowName}>{item.nameKo}</Text>
              <Text style={styles.rowMeta}>{renderRight(item)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '700', paddingHorizontal: 20, marginBottom: 16 },
  segmentBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  segment: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#1a1a1a',
  },
  segmentActive: { backgroundColor: '#FFFFFF' },
  segmentText: { color: '#aaa', fontSize: 13, fontWeight: '500' },
  segmentTextActive: { color: '#000' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  rowName: { color: '#FFFFFF', fontSize: 17, fontWeight: '500', flex: 1 },
  rowMeta: { color: '#aaa', fontSize: 13 },
  separator: { height: 1, backgroundColor: '#1a1a1a', marginHorizontal: 20 },
  empty: { padding: 48, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 14 },
  retryBtn: { marginTop: 16, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#222', borderRadius: 8 },
  retryText: { color: '#FFFFFF', fontSize: 13 },
});

export default BarListScreen;
