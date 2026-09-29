// ErrorState.tsx — 화면 전반에서 재사용하는 에러 표시 + 재시도.
// 감사 결과 대부분의 화면이 에러를 console.error 로만 삼키고 있었다.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import { colors, fonts, fontSize, radius, spacing } from '../../lib/theme';

interface Props {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  /** 리스트 내부(ListEmptyComponent)에 넣을 때 상단 여백을 줄인다. */
  compact?: boolean;
  /** 어두운 배경 화면(BarList 등)에서 텍스트/버튼 대비를 뒤집는다. */
  tone?: 'light' | 'dark';
}

const ErrorState: React.FC<Props> = ({
  message = '문제가 발생했습니다.',
  onRetry,
  retryLabel = '다시 시도',
  compact = false,
  tone = 'light',
}) => {
  const onDark = tone === 'dark';
  return (
    <View
      style={[styles.container, compact && styles.compact]}
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[styles.message, onDark && styles.messageOnDark]}>{message}</Text>
      {!!onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, onDark && styles.retryButtonOnDark]}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.retryText, onDark && styles.retryTextOnDark]}>{retryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorState;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: heightPercentage(spacing.xxxl * 2),
    paddingHorizontal: widthPercentage(spacing.xl),
  },
  compact: { paddingVertical: heightPercentage(spacing.xxxl) },
  icon: { fontFamily: fonts.regular, fontSize: fontPercentage(28), marginBottom: heightPercentage(spacing.md) },
  message: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.base),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontPercentage(22),
  },
  retryButton: {
    marginTop: heightPercentage(spacing.lg),
    paddingHorizontal: widthPercentage(spacing.xl),
    paddingVertical: heightPercentage(spacing.sm + 2),
    borderRadius: radius.pill,
    backgroundColor: colors.bgInverse,
  },
  retryText: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.textInverse,
  },
  messageOnDark: { color: colors.textTertiary },
  retryButtonOnDark: { backgroundColor: colors.bg },
  retryTextOnDark: { color: colors.text },
});
