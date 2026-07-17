// NewsDetailScreen.tsx (T-21)
// GET /api/v2/news/{id} → 이미지·제목·출처·발행일·본문.
// 진입 시 POST /api/v2/news/{id}/read 로 조회수 기록(실패해도 화면은 진행).
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
import type { NewsDetail } from '../../types/api';
import { RootStackParamList } from '../../Navigation/Navigation';
import Markdown from 'react-native-markdown-display';
import ErrorState from '../../Components/common/ErrorState';
import SkeletonList from '../../Components/common/SkeletonList';
import { formatDate } from '../../lib/date';

const NewsDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'NewsDetailScreen'>>();
  const { newsId } = route.params;

  const [detail, setDetail] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const readSent = useRef(false);

  useEffect(() => () => { mounted.current = false; }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await instance.get(`/api/v2/news/${newsId}`);
      const data = unwrap<NewsDetail>(res);
      if (!mounted.current) { return; }
      setDetail(data);

      // 조회수 기록은 한 번만. 실패해도 사용자 흐름을 막지 않는다.
      if (!readSent.current) {
        readSent.current = true;
        fireAndForget(instance.post(`/api/v2/news/${newsId}/read`));
      }
    } catch (e) {
      if (!mounted.current) { return; }
      setError(toUserMessage(e, '뉴스를 불러오지 못했습니다.'));
    } finally {
      if (mounted.current) { setLoading(false); }
    }
  }, [newsId]);

  useEffect(() => { load(); }, [load]);

  const openSource = () => {
    if (detail?.sourceUrl) { Linking.openURL(detail.sourceUrl).catch(() => {}); }
  };

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
        <Text style={styles.headerTitle}>뉴스</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <SkeletonList count={1} variant="card" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !detail ? (
        <ErrorState message="뉴스를 찾을 수 없습니다." />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + heightPercentage(spacing.xxxl) }}
          showsVerticalScrollIndicator={false}
        >
          {/* imageUrl 은 null 일 수 있다(시드 데이터 전부 null). 없으면 이미지 영역을 생략. */}
          {!!detail.imageUrl && (
            <Image source={{ uri: detail.imageUrl }} style={styles.hero} resizeMode="cover" />
          )}

          <View style={styles.body}>
            <Text style={styles.category}>{detail.categoryLabel}</Text>
            <Text style={styles.title} lineBreakStrategyIOS="hangul-word" textBreakStrategy="balanced">{detail.title}</Text>

            <View style={styles.metaRow}>
              {/* 백엔드에 author 는 없다. source 가 출처다. */}
              {!!detail.source && <Text style={styles.source}>{detail.source}</Text>}
              {!!detail.source && !!detail.publishedAt && <Text style={styles.metaDot}>·</Text>}
              {!!detail.publishedAt && (
                <Text style={styles.date}>{formatDate(detail.publishedAt)}</Text>
              )}
            </View>

            {!!detail.summary && <Text style={styles.summary}>{detail.summary}</Text>}

            {/* 본문은 마크다운이다. 이전에는 Text 로 그대로 뿌려 '# 테스트 본문' 이
                그대로 찍혔다(QA I-10). */}
            {detail.content ? (
              <Markdown style={markdownStyles}>{detail.content}</Markdown>
            ) : (
              <Text style={styles.content}>본문이 아직 준비되지 않았습니다.</Text>
            )}

            {/* sourceUrl 은 현재 시드에서 전부 null. 있을 때만 노출. */}
            {!!detail.sourceUrl && (
              <TouchableOpacity
                style={styles.sourceButton}
                onPress={openSource}
                accessibilityRole="link"
                accessibilityLabel="원문 보기"
              >
                <Text style={styles.sourceButtonText}>원문 보기</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

// react-native-markdown-display 는 Text/View 스타일 객체를 요소별로 받는다.
// 기존 본문 톤(colors.text / lineHeight)을 유지하면서 heading 계층만 살린다.
const markdownStyles = {
  body: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.md),
    lineHeight: heightPercentage(26),
  },
  heading1: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: fontPercentage(fontSize.xl),
    lineHeight: heightPercentage(32),
    marginTop: heightPercentage(spacing.lg),
    marginBottom: heightPercentage(spacing.sm),
  },
  heading2: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: fontPercentage(fontSize.lg),
    lineHeight: heightPercentage(28),
    marginTop: heightPercentage(spacing.md),
    marginBottom: heightPercentage(spacing.xs),
  },
  heading3: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.md),
    marginTop: heightPercentage(spacing.md),
  },
  strong: { fontFamily: fonts.bold },
  em: { fontStyle: 'italic' as const },
  bullet_list: { marginVertical: heightPercentage(spacing.xs) },
  link: { color: colors.accent, textDecorationLine: 'underline' as const },
  hr: { backgroundColor: colors.border, height: 1, marginVertical: heightPercentage(spacing.lg) },
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
  backChevron: {
    fontSize: fontPercentage(30),
    color: colors.text,
    lineHeight: fontPercentage(32),
  },
  headerTitle: { fontFamily: fonts.semibold, fontSize: fontPercentage(fontSize.lg), color: colors.text },
  headerSpacer: { width: widthPercentage(spacing.xl) },

  hero: { width: '100%', height: heightPercentage(220), backgroundColor: colors.skeleton },
  body: { padding: widthPercentage(spacing.xl) },
  category: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(fontSize.xs),
    color: colors.accent,
    marginBottom: heightPercentage(spacing.sm),
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(fontSize.xxl),
    color: colors.text,
    lineHeight: fontPercentage(31),
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
  summary: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.base),
    color: colors.textSecondary,
    lineHeight: fontPercentage(24),
    paddingLeft: widthPercentage(spacing.md),
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
    marginBottom: heightPercentage(spacing.xl),
  },
  content: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.base),
    color: colors.text,
    lineHeight: fontPercentage(26),
  },
  sourceButton: {
    marginTop: heightPercentage(spacing.xxl),
    alignSelf: 'flex-start',
    paddingHorizontal: widthPercentage(spacing.lg),
    paddingVertical: heightPercentage(spacing.sm + 2),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  sourceButtonText: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.text,
  },
});
