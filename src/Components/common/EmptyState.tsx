// EmptyState.tsx — "데이터가 0건"과 "에러"는 다른 상태다. 섞지 않는다.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import { colors, fonts, fontSize, radius, spacing } from '../../lib/theme';

interface Props {
  title: string;
  description?: string;
  emoji?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  /** 어두운 배경 화면(BarList 등)에서 대비를 뒤집는다. */
  tone?: 'light' | 'dark';
}

const EmptyState: React.FC<Props> = ({
  title,
  description,
  emoji = '🍸',
  actionLabel,
  onAction,
  compact = false,
  tone = 'light',
}) => {
  const onDark = tone === 'dark';
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.title, onDark && styles.titleOnDark]}>{title}</Text>
      {!!description && (
        <Text style={[styles.description, onDark && styles.descriptionOnDark]}>{description}</Text>
      )}
      {!!actionLabel && !!onAction && (
        <TouchableOpacity
          style={[styles.actionButton, onDark && styles.actionButtonOnDark]}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={[styles.actionText, onDark && styles.actionTextOnDark]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: heightPercentage(spacing.xxxl * 2),
    paddingHorizontal: widthPercentage(spacing.xl),
  },
  compact: { paddingVertical: heightPercentage(spacing.xxxl) },
  emoji: { fontFamily: fonts.regular, fontSize: fontPercentage(32), marginBottom: heightPercentage(spacing.md) },
  title: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.md),
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    marginTop: heightPercentage(spacing.sm),
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: fontPercentage(20),
  },
  actionButton: {
    marginTop: heightPercentage(spacing.lg),
    paddingHorizontal: widthPercentage(spacing.xl),
    paddingVertical: heightPercentage(spacing.sm + 2),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  actionText: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.text,
  },
  titleOnDark: { color: colors.textInverse },
  descriptionOnDark: { color: colors.textTertiary },
  actionButtonOnDark: { borderColor: colors.textSecondary },
  actionTextOnDark: { color: colors.textInverse },
});
