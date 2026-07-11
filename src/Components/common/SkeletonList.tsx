// SkeletonList.tsx — 스피너 대신 레이아웃을 미리 잡아 화면 점프를 없앤다.
// 감사 결과 앱 전체에 스켈레톤이 0개였다(ActivityIndicator 33회).
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import { colors, radius, spacing } from '../../lib/theme';

type Variant = 'card' | 'row' | 'step';

interface Props {
  count?: number;
  variant?: Variant;
}

const useShimmer = () => {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return opacity;
};

const SkeletonList: React.FC<Props> = ({ count = 4, variant = 'card' }) => {
  const opacity = useShimmer();

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel="불러오는 중"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Animated.View key={i} style={[styles.item, { opacity }]}>
          {variant === 'card' && (
            <>
              <View style={styles.thumb} />
              <View style={styles.lineWide} />
              <View style={styles.lineNarrow} />
            </>
          )}
          {variant === 'row' && (
            <View style={styles.row}>
              <View style={styles.avatar} />
              <View style={styles.rowText}>
                <View style={styles.lineWide} />
                <View style={styles.lineNarrow} />
              </View>
            </View>
          )}
          {variant === 'step' && (
            <View style={styles.row}>
              <View style={styles.badge} />
              <View style={styles.rowText}>
                <View style={styles.lineWide} />
                <View style={styles.lineNarrow} />
              </View>
            </View>
          )}
        </Animated.View>
      ))}
    </View>
  );
};

export default SkeletonList;

const bar = {
  backgroundColor: colors.skeleton,
  borderRadius: radius.sm,
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: widthPercentage(spacing.lg) },
  item: { marginBottom: heightPercentage(spacing.xl) },
  thumb: {
    ...bar,
    width: '100%',
    height: heightPercentage(160),
    borderRadius: radius.lg,
    marginBottom: heightPercentage(spacing.md),
  },
  lineWide: { ...bar, width: '85%', height: heightPercentage(14) },
  lineNarrow: {
    ...bar,
    width: '45%',
    height: heightPercentage(12),
    marginTop: heightPercentage(spacing.sm),
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    ...bar,
    width: widthPercentage(56),
    height: widthPercentage(56),
    borderRadius: radius.md,
    marginRight: widthPercentage(spacing.md),
  },
  badge: {
    ...bar,
    width: widthPercentage(32),
    height: widthPercentage(32),
    borderRadius: radius.pill,
    marginRight: widthPercentage(spacing.md),
  },
  rowText: { flex: 1 },
});
