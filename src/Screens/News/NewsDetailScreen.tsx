// NewsDetailScreen.tsx — 매거진 상세(라우트 이름은 호환 위해 유지).
// GET /api/v2/magazine/{id} → 블록 content 를 MagazineBlockRenderer 로 렌더.
// 진입 시 POST /api/v2/magazine/{id}/read 로 조회수 기록(실패해도 화면은 진행).
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import instance from '../../tokenRequest/axios_interceptor';
import { unwrap, toUserMessage, fireAndForget } from '../../lib/api';
import { colors, fonts, fontSize, radius, spacing } from '../../lib/theme';
import type { MagazineDetail } from '../../types/api';
import { RootStackParamList } from '../../Navigation/Navigation';
import MagazineBlockRenderer from './MagazineBlockRenderer';
import ErrorBoundary from '../../Components/common/ErrorBoundary';
import ErrorState from '../../Components/common/ErrorState';
import SkeletonList from '../../Components/common/SkeletonList';
import { formatDate } from '../../lib/date';

const NewsDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'NewsDetailScreen'>>();
  const { newsId } = route.params;

  const [detail, setDetail] = useState<MagazineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const readSent = useRef(false);

  useEffect(() => () => { mounted.current = false; }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await instance.get(`/api/v2/magazine/${newsId}`);
      const data = unwrap<MagazineDetail>(res);
      if (!mounted.current) { return; }
      setDetail(data);

      if (!readSent.current) {
        readSent.current = true;
        fireAndForget(instance.post(`/api/v2/magazine/${newsId}/read`));
      }
    } catch (e) {
      if (!mounted.current) { return; }
      setError(toUserMessage(e, '글을 불러오지 못했습니다.'));
    } finally {
      if (mounted.current) { setLoading(false); }
    }
  }, [newsId]);

  useEffect(() => { load(); }, [load]);

  const openSource = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const goCocktail = (cocktailId: number) => {
    navigation.navigate('CocktailDetailScreen', { cocktailId });
  };

  const titleText = detail?.titleLines && detail.titleLines.length > 0
    ? detail.titleLines.join('\n')
    : detail?.title ?? '';

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + heightPercentage(spacing.sm) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>매거진</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <SkeletonList count={1} variant="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !detail ? (
        <ErrorState message="글을 찾을 수 없습니다." />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + heightPercentage(spacing.xxxl) }}
          showsVerticalScrollIndicator={false}
        >
          {!!detail.heroImage && (
            <>
              <Image source={{ uri: detail.heroImage }} style={styles.hero} resizeMode="cover" />
              {!!detail.imageCaption && <Text style={styles.caption}>{detail.imageCaption}</Text>}
            </>
          )}

          <View style={styles.body}>
            {!!detail.subcategory && <Text style={styles.category}>{detail.subcategory}</Text>}
            <Text
              style={styles.title}
              accessibilityRole="header"
              lineBreakStrategyIOS="hangul-word"
              textBreakStrategy="balanced">
              {titleText}
            </Text>

            <View style={styles.metaRow}>
              {!!detail.authorName && <Text style={styles.source}>{detail.authorName}</Text>}
              {!!detail.authorName && !!detail.publishedAt && <Text style={styles.metaDot}>·</Text>}
              {!!detail.publishedAt && <Text style={styles.date}>{formatDate(detail.publishedAt)}</Text>}
            </View>

            {!!detail.dek && <Text style={styles.summary}>{detail.dek}</Text>}

            {/* 본문 블록은 서버 JSONB 원본이라 형태를 보장할 수 없다.
                여기서 막지 않으면 루트 ErrorBoundary 까지 올라가 앱 전체가 리셋된다. */}
            <ErrorBoundary
              fallback={() => (
                <Text style={styles.summary}>본문을 표시할 수 없습니다.</Text>
              )}
            >
              <MagazineBlockRenderer blocks={detail.content} onCocktailPress={goCocktail} />
            </ErrorBoundary>

            {detail.tags && detail.tags.length > 0 && (
              <View style={styles.tagRow}>
                {detail.tags.map((t, i) => (
                  <View key={i} style={styles.tagChip}><Text style={styles.tagText}>#{t}</Text></View>
                ))}
              </View>
            )}

            {detail.refs?.sources && detail.refs.sources.length > 0 && (
              <View style={styles.sources}>
                <Text style={styles.sourcesTitle}>출처</Text>
                {detail.refs.sources.map((s, i) => (
                  <TouchableOpacity key={i} onPress={() => openSource(s.url)} accessibilityRole="link">
                    <Text style={styles.sourceLink}>· {s.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default NewsDetailScreen;

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
  backChevron: { fontSize: fontPercentage(30), color: colors.text, lineHeight: fontPercentage(32) },
  headerTitle: { fontFamily: fonts.semibold, fontSize: fontPercentage(fontSize.lg), color: colors.text },
  headerSpacer: { width: widthPercentage(spacing.xl) },

  hero: { width: '100%', height: heightPercentage(220), backgroundColor: colors.skeleton },
  caption: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.xs),
    color: colors.textTertiary,
    paddingHorizontal: widthPercentage(spacing.xl),
    paddingTop: heightPercentage(spacing.sm),
  },
  body: { padding: widthPercentage(spacing.xl) },
  category: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(fontSize.xs),
    color: colors.accentText,
    marginBottom: heightPercentage(spacing.sm),
  },
  // 본문 소제목(heading)이 22 로 커졌으므로 기사 제목은 그보다 확실히 위여야 한다.
  title: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(fontSize.hero),
    color: colors.text,
    lineHeight: fontPercentage(34),
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: heightPercentage(spacing.md),
    marginBottom: heightPercentage(spacing.xl),
  },
  source: { fontFamily: fonts.medium, fontSize: fontPercentage(fontSize.sm), color: colors.textSecondary },
  metaDot: { marginHorizontal: widthPercentage(spacing.sm), color: colors.textDisabled },
  date: { fontFamily: fonts.regular, fontSize: fontPercentage(fontSize.sm), color: colors.textTertiary },
  // 리드문도 읽는 텍스트다 — 본문(17)보다 한 단 아래인 16 으로 두되 행간은 넉넉히.
  summary: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.md),
    color: colors.textSecondary,
    lineHeight: fontPercentage(27),
    letterSpacing: -0.3,
    paddingLeft: widthPercentage(spacing.md),
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
    marginBottom: heightPercentage(spacing.xl),
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: heightPercentage(spacing.xl),
  },
  tagChip: {
    backgroundColor: colors.bgSubtle,
    borderRadius: radius.pill,
    paddingHorizontal: widthPercentage(spacing.md),
    paddingVertical: heightPercentage(spacing.xs),
    marginRight: widthPercentage(spacing.sm),
    marginBottom: heightPercentage(spacing.sm),
  },
  tagText: { fontFamily: fonts.medium, fontSize: fontPercentage(fontSize.xs), color: colors.textSecondary },
  sources: {
    marginTop: heightPercentage(spacing.xxl),
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: heightPercentage(spacing.lg),
  },
  sourcesTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.textSecondary,
    marginBottom: heightPercentage(spacing.sm),
  },
  sourceLink: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.accentText,
    lineHeight: fontPercentage(22),
  },
});
