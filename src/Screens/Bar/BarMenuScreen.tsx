// BarMenuScreen.tsx (T-23)
//
// 네이티브 메뉴판. BarMenuWebViewScreen(백엔드 SSR 을 WebView 로 감싸던 것)을 대체한다.
//
// 가격 게이팅은 **서버가** 한다 (실측 확인):
//   L0/L1 → 응답 아이템에 `price` 키가 아예 없다. `priceBand`(LOW/MID/HIGH)만 온다.
//   L2    → `price`("21,160원") 가 함께 온다.
// 즉 클라이언트가 가리는 게 아니라 애초에 받지 못한다. 프론트는 그 사실을 UI 로 설명할 뿐이다.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import instance from '../../tokenRequest/axios_interceptor';
import { unwrap, toUserMessage } from '../../lib/api';
import { colors, fonts, fontSize, radius, spacing } from '../../lib/theme';
import { RootStackParamList } from '../../Navigation/Navigation';
import ErrorState from '../../Components/common/ErrorState';
import EmptyState from '../../Components/common/EmptyState';
import SkeletonList from '../../Components/common/SkeletonList';
import {
  getSession,
  sessionHeader,
  subscribe,
  renewIfNeeded,
  msUntilExpiry,
  needsRenew,
  type BarSession,
  type TrustLevel,
} from '../../services/BarSessionStore';
import { detectMockLocation } from '../../native/MockLocationDetector';

type PriceBand = 'LOW' | 'MID' | 'HIGH';

interface MenuItem {
  id: number;
  name: string;
  nameEn: string | null;
  description: string | null;
  isAvailable: boolean;
  priceBand: PriceBand | null;
  /** L2 세션에서만 존재한다. 그 외에는 **키 자체가 없다**. */
  price?: string;
}

interface MenuCategory {
  id: number;
  nameKo: string;
  nameEn: string | null;
  priority: number;
  items: MenuItem[];
}

interface MenuResponse {
  priceVisible: boolean;
  trustLevel: TrustLevel;
  categories: MenuCategory[];
}

const BAND_LABEL: Record<PriceBand, string> = {
  LOW: '~1.5만원대',
  MID: '1.5–2.2만원대',
  HIGH: '2.2만원대 이상',
};

const formatCountdown = (ms: number): string => {
  if (ms <= 0) { return '만료됨'; }
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${String(sec).padStart(2, '0')}`;
};

function currentPosition(): Promise<{ lat: number; lng: number; accuracyM: number }> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracyM: p.coords.accuracy ?? 9999 }),
      reject,
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  });
}

const BarMenuScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'BarMenuScreen'>>();
  const { slug, barName, notice } = route.params;

  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<BarSession | null>(() => getSession(slug));
  const [remainingMs, setRemainingMs] = useState<number>(() => {
    const s = getSession(slug);
    return s ? msUntilExpiry(s) : 0;
  });

  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  // 세션 변경(스캔 성공/만료/폐기)을 구독한다.
  useEffect(() => subscribe(slug, setSession), [slug]);

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') { setLoading(true); }
    setError(null);
    try {
      // 세션이 있으면 헤더를 붙인다. 없으면 그냥 L0 응답을 받는다(공개 엔드포인트).
      const res = await instance.get(`/api/v2/bars/${slug}/menu`, {
        headers: sessionHeader(slug),
      });
      const data = unwrap<MenuResponse>(res);
      if (mounted.current) { setMenu(data); }
    } catch (e) {
      if (mounted.current) { setError(toUserMessage(e, '메뉴판을 불러오지 못했습니다.')); }
    } finally {
      if (mounted.current) { setLoading(false); setRefreshing(false); }
    }
  }, [slug]);

  useEffect(() => { load('initial'); }, [load]);

  // 세션의 신뢰등급이 바뀌면 가격 가시성이 바뀌므로 메뉴를 다시 받는다.
  const lastTrust = useRef<TrustLevel | undefined>(session?.trustLevel);
  useEffect(() => {
    const t = session?.trustLevel;
    if (t !== lastTrust.current) {
      lastTrust.current = t;
      load('initial');
    }
  }, [session?.trustLevel, load]);

  // 화면에 있는 동안 만료 카운트다운 + 임박 시 자동 갱신.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const tick = async () => {
        const s = getSession(slug);
        if (!s) {
          if (!cancelled && mounted.current) { setRemainingMs(0); }
          return;
        }
        if (!cancelled && mounted.current) { setRemainingMs(msUntilExpiry(s)); }

        if (needsRenew(s)) {
          try {
            const pos = await currentPosition();
            const mockLocationDetected = await detectMockLocation();
            await renewIfNeeded(slug, { ...pos, mockLocationDetected });
          } catch {
            // 갱신 실패는 조용히 넘긴다. 만료되면 세션이 사라지고 UI 가 L0 로 내려간다.
          }
        }
      };
      tick();
      const id = setInterval(tick, 1000);
      return () => { cancelled = true; clearInterval(id); };
    }, [slug]),
  );

  const trustLevel: TrustLevel = menu?.trustLevel ?? session?.trustLevel ?? 'L0';
  const priceVisible = menu?.priceVisible ?? false;
  const canChat = session?.chatEnabled === true && trustLevel !== 'L0';

  const goScan = () => navigation.navigate('QrScanScreen', { slug, barName });
  const goChat = () => navigation.navigate('BarChatScreen', { slug, barName });

  const sections = (menu?.categories ?? []).map(c => ({
    title: c.nameKo,
    subtitle: c.nameEn,
    data: c.items,
  }));

  const renderItem = ({ item }: { item: MenuItem }) => (
    <View style={[styles.item, !item.isAvailable && styles.itemUnavailable]}>
      <View style={styles.itemText}>
        <Text style={styles.itemName}>{item.name}</Text>
        {!!item.nameEn && <Text style={styles.itemNameEn}>{item.nameEn}</Text>}
        {!!item.description && (
          <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
        )}
        {!item.isAvailable && <Text style={styles.soldOut}>품절</Text>}
      </View>

      <View style={styles.priceCol}>
        {priceVisible && item.price ? (
          <Text style={styles.price}>{item.price}</Text>
        ) : (
          <>
            <Text style={styles.lock}>🔒</Text>
            <Text style={styles.band}>
              {item.priceBand ? BAND_LABEL[item.priceBand] : '가격 문의'}
            </Text>
          </>
        )}
      </View>
    </View>
  );

  const renderGate = () => {
    if (priceVisible) {
      return (
        <View style={styles.gateL2}>
          <Text style={styles.gateL2Text}>
            매장 인증 완료 · 가격 공개 중
          </Text>
          <Text style={styles.gateTimer}>{formatCountdown(remainingMs)} 후 만료</Text>
        </View>
      );
    }
    return (
      <TouchableOpacity
        style={styles.gate}
        onPress={goScan}
        accessibilityRole="button"
        accessibilityLabel="QR 스캔하고 가격 보기"
      >
        <View style={styles.gateTextWrap}>
          <Text style={styles.gateTitle}>QR 스캔하고 가격 보기</Text>
          <Text style={styles.gateSub}>
            {trustLevel === 'L1'
              ? '매장 안에 계시네요. 테이블 QR을 찍으면 가격이 열려요.'
              : '매장 안에서 테이블 QR을 찍으면 정확한 가격을 볼 수 있어요.'}
          </Text>
        </View>
        <Text style={styles.gateArrow}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 흰 배경 화면. 바 목록(검정)에서 push 되면 light-content 가 따라오므로 직접 되돌린다. */}
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <View style={[styles.header, { paddingTop: insets.top + heightPercentage(spacing.sm) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {barName ? `${barName} 메뉴판` : '메뉴판'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {!!notice && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}

      {loading ? (
        <SkeletonList count={5} variant="row" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load('initial')} />
      ) : sections.length === 0 ? (
        <EmptyState title="아직 등록된 메뉴가 없어요" emoji="🍸" />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={renderGate()}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {!!section.subtitle && <Text style={styles.sectionSub}>{section.subtitle}</Text>}
            </View>
          )}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load('refresh'); }}
              tintColor={colors.accent}
            />
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + heightPercentage(spacing.xxxl * 3) }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {canChat && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + heightPercentage(spacing.md) }]}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={goChat}
            accessibilityRole="button"
            accessibilityLabel="익명 채팅방 입장"
          >
            <Text style={styles.chatButtonText}>이 매장 익명 채팅방 입장</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default BarMenuScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: widthPercentage(spacing.lg),
    paddingBottom: heightPercentage(spacing.sm + 2),
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  back: { fontFamily: fonts.regular, fontSize: fontPercentage(30), color: colors.text, lineHeight: fontPercentage(32) },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.lg),
    color: colors.text,
  },
  headerSpacer: { width: widthPercentage(spacing.xl) },

  notice: {
    marginHorizontal: widthPercentage(spacing.lg),
    marginTop: heightPercentage(spacing.md),
    padding: widthPercentage(spacing.md),
    borderRadius: radius.sm,
    backgroundColor: '#FFF4E5',
  },
  noticeText: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.sm),
    color: '#8A5A00',
    lineHeight: fontPercentage(20),
  },

  gate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: widthPercentage(spacing.lg),
    padding: widthPercentage(spacing.lg),
    borderRadius: radius.md,
    backgroundColor: colors.bgInverse,
  },
  gateTextWrap: { flex: 1 },
  gateTitle: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.md),
    color: colors.textInverse,
  },
  gateSub: {
    marginTop: heightPercentage(spacing.xs),
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.xs),
    color: colors.textTertiary,
    lineHeight: fontPercentage(18),
  },
  gateArrow: { fontFamily: fonts.regular, fontSize: fontPercentage(fontSize.xl), color: colors.textInverse },

  gateL2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: widthPercentage(spacing.lg),
    paddingHorizontal: widthPercentage(spacing.lg),
    paddingVertical: heightPercentage(spacing.md),
    borderRadius: radius.md,
    backgroundColor: colors.bgSubtle,
  },
  gateL2Text: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.text,
  },
  gateTimer: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.xs),
    color: colors.textTertiary,
  },

  sectionHeader: {
    paddingHorizontal: widthPercentage(spacing.lg),
    paddingTop: heightPercentage(spacing.xxl),
    paddingBottom: heightPercentage(spacing.sm),
  },
  sectionTitle: { fontFamily: fonts.bold, fontSize: fontPercentage(fontSize.lg), color: colors.text },
  sectionSub: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.xs),
    color: colors.textTertiary,
    marginTop: heightPercentage(2),
  },

  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: widthPercentage(spacing.lg),
    paddingVertical: heightPercentage(spacing.md),
  },
  itemUnavailable: { opacity: 0.45 },
  itemText: { flex: 1, paddingRight: widthPercentage(spacing.md) },
  itemName: { fontFamily: fonts.medium, fontSize: fontPercentage(fontSize.base), color: colors.text },
  itemNameEn: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.xs),
    color: colors.textTertiary,
    marginTop: 1,
  },
  itemDesc: {
    marginTop: heightPercentage(spacing.xs),
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.textTertiary,
    lineHeight: fontPercentage(19),
  },
  soldOut: {
    marginTop: heightPercentage(spacing.xs),
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.xs),
    color: colors.danger,
  },

  priceCol: { alignItems: 'flex-end', minWidth: widthPercentage(96) },
  price: { fontFamily: fonts.bold, fontSize: fontPercentage(fontSize.base), color: colors.text },
  lock: { fontFamily: fonts.regular, fontSize: fontPercentage(fontSize.sm) },
  band: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.xs),
    color: colors.textTertiary,
    textAlign: 'right',
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: widthPercentage(spacing.lg),
    paddingTop: heightPercentage(spacing.md),
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  chatButton: {
    height: heightPercentage(52),
    borderRadius: radius.pill,
    backgroundColor: colors.bgInverse,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonText: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.md),
    color: colors.textInverse,
  },
});
