// CocktailStepsScreen.tsx (T-21)
// GET /api/v2/cocktails/{id}/steps → 단계별 카드.
// "만들어봤어요" → POST /api/v2/cocktails/{id}/made (JWT 필요, 비로그인이면 로그인 유도)
//
// 감사에서 확인된 근본 갭: 도메인 모델에 제조 스텝이 없어 "레시피 북"이 만드는 법을 못 보여줬다.
// 백엔드 T-07 이 cocktail_step 을 추가하면서 이 화면이 처음으로 가능해졌다.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import instance from '../../tokenRequest/axios_interceptor';
import { unwrap, toUserMessage, isUnauthorized } from '../../lib/api';
import { colors, fonts, fontSize, radius, spacing } from '../../lib/theme';
import type { CocktailStep } from '../../types/api';
import { RootStackParamList } from '../../Navigation/Navigation';
import ErrorState from '../../Components/common/ErrorState';
import EmptyState from '../../Components/common/EmptyState';
import SkeletonList from '../../Components/common/SkeletonList';
import { useToast } from '../../Components/ToastContext';

const formatDuration = (sec: number | null): string | null => {
  if (!sec) { return null; }
  if (sec < 60) { return `약 ${sec}초`; }
  return `약 ${Math.round(sec / 60)}분`;
};

const CocktailStepsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'CocktailStepsScreen'>>();
  const { cocktailId, cocktailName } = route.params;
  const { showToast } = useToast();

  const [steps, setSteps] = useState<CocktailStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [made, setMade] = useState(false);
  const mounted = useRef(true);

  useEffect(() => () => { mounted.current = false; }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await instance.get(`/api/v2/cocktails/${cocktailId}/steps`);
      // data 는 CocktailStep[] 배열 그 자체다({items} 로 감싸지 않는다).
      const data = unwrap<CocktailStep[]>(res);
      if (mounted.current) { setSteps(Array.isArray(data) ? data : []); }
    } catch (e) {
      if (mounted.current) { setError(toUserMessage(e, '제조 단계를 불러오지 못했습니다.')); }
    } finally {
      if (mounted.current) { setLoading(false); }
    }
  }, [cocktailId]);

  useEffect(() => { load(); }, [load]);

  const handleMade = async () => {
    if (submitting || made) { return; }
    setSubmitting(true);
    try {
      await instance.post(`/api/v2/cocktails/${cocktailId}/made`);
      if (!mounted.current) { return; }
      setMade(true);
      showToast('기록했어요. 다음 추천에 반영됩니다.');
    } catch (e) {
      if (!mounted.current) { return; }
      if (isUnauthorized(e)) {
        showToast('로그인이 필요합니다.');
        navigation.navigate('Login');
      } else {
        showToast(toUserMessage(e, '기록하지 못했습니다.'));
      }
    } finally {
      if (mounted.current) { setSubmitting(false); }
    }
  };

  const renderBody = () => {
    if (loading) { return <SkeletonList count={4} variant="step" />; }
    if (error) { return <ErrorState message={error} onRetry={load} />; }
    if (steps.length === 0) {
      return (
        <EmptyState
          title="아직 제조 단계가 준비되지 않았어요"
          description="다른 칵테일의 만드는 법을 먼저 살펴보시겠어요?"
          actionLabel="레시피 북으로"
          onAction={() => navigation.navigate('BottomTabNavigator', { screen: '레시피북' })}
        />
      );
    }

    return (
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + heightPercentage(spacing.xxxl * 3),
        }}
        showsVerticalScrollIndicator={false}
      >
        {steps.map(step => {
          const duration = formatDuration(step.durationSec);
          return (
            // stepOrder 가 사실상 키다. 응답에 id 필드는 없다.
            <View key={step.stepOrder} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{step.stepOrder}</Text>
                </View>
                {!!duration && <Text style={styles.stepDuration}>{duration}</Text>}
              </View>

              {!!step.imageUrl && (
                <Image source={{ uri: step.imageUrl }} style={styles.stepImage} resizeMode="cover" />
              )}

              <Text style={styles.stepInstruction}>{step.instruction}</Text>

              {!!step.tip && (
                <View style={styles.tipBox}>
                  <Text style={styles.tipLabel}>TIP</Text>
                  <Text style={styles.tipText}>{step.tip}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {cocktailName ? `${cocktailName} 만드는 법` : '만드는 법'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {renderBody()}

      {/* 스텝이 있을 때만 하단 CTA 노출 */}
      {!loading && !error && steps.length > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + heightPercentage(spacing.md) }]}>
          <TouchableOpacity
            style={[styles.madeButton, made && styles.madeButtonDone]}
            onPress={handleMade}
            disabled={submitting || made}
            accessibilityRole="button"
            accessibilityLabel="만들어봤어요"
            accessibilityState={{ disabled: submitting || made }}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Text style={styles.madeButtonText}>
                {made ? '기록됨 ✓' : '만들어봤어요'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CocktailStepsScreen;

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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.lg),
    color: colors.text,
  },
  headerSpacer: { width: widthPercentage(spacing.xl) },

  stepCard: {
    marginHorizontal: widthPercentage(spacing.lg),
    marginTop: heightPercentage(spacing.lg),
    padding: widthPercentage(spacing.lg),
    borderRadius: radius.lg,
    backgroundColor: colors.bgSubtle,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: heightPercentage(spacing.md),
  },
  stepBadge: {
    width: widthPercentage(28),
    height: widthPercentage(28),
    borderRadius: radius.pill,
    backgroundColor: colors.bgInverse,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.textInverse,
  },
  stepDuration: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.xs),
    color: colors.textTertiary,
  },
  stepImage: {
    width: '100%',
    height: heightPercentage(160),
    borderRadius: radius.md,
    backgroundColor: colors.skeleton,
    marginBottom: heightPercentage(spacing.md),
  },
  stepInstruction: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.base),
    color: colors.text,
    lineHeight: fontPercentage(24),
  },
  tipBox: {
    flexDirection: 'row',
    marginTop: heightPercentage(spacing.md),
    padding: widthPercentage(spacing.md),
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
  },
  tipLabel: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(fontSize.xs),
    color: colors.accent,
    marginRight: widthPercentage(spacing.sm),
  },
  tipText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.textSecondary,
    lineHeight: fontPercentage(20),
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
  madeButton: {
    height: heightPercentage(52),
    borderRadius: radius.pill,
    backgroundColor: colors.bgInverse,
    alignItems: 'center',
    justifyContent: 'center',
  },
  madeButtonDone: { backgroundColor: colors.textSecondary },
  madeButtonText: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.md),
    color: colors.textInverse,
  },
});
