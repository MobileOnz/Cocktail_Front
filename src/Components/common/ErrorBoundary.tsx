// ErrorBoundary.tsx — 앱 전역 JS 예외 방어막.
// 감사 결과 ErrorBoundary 가 0개라, 렌더 중 예외 하나면 화이트스크린으로 앱이 죽었다.
// (예: RecommendResultScreen 이 data.flavors 를 무가드로 읽는다)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import { colors, fonts, fontSize, radius, spacing } from '../../lib/theme';

interface Props {
  children: React.ReactNode;
  /** 폴백 UI 를 직접 주고 싶을 때. reset() 을 호출하면 재시도한다. */
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface State {
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // 개발 중엔 콘솔, 배포본에선 Crashlytics 로 남긴다.
    console.error('[ErrorBoundary]', error, info.componentStack);
    try {
      crashlytics().recordError(error);
    } catch {
      // Crashlytics 미초기화 환경(테스트 등)에서는 무시한다.
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) { return this.props.children; }

    if (this.props.fallback) { return this.props.fallback(error, this.reset); }

    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>🍸</Text>
        <Text style={styles.title}>예기치 못한 문제가 발생했어요</Text>
        <Text style={styles.description}>
          잠시 후 다시 시도해주세요. 문제가 계속되면 문의해주세요.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={this.reset}
          accessibilityRole="button"
          accessibilityLabel="다시 시도"
        >
          <Text style={styles.buttonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default ErrorBoundary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: widthPercentage(spacing.xxl),
    backgroundColor: colors.bg,
  },
  emoji: { fontFamily: fonts.regular, fontSize: fontPercentage(40), marginBottom: heightPercentage(spacing.lg) },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(fontSize.lg),
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
  button: {
    marginTop: heightPercentage(spacing.xxl),
    paddingHorizontal: widthPercentage(spacing.xxl),
    paddingVertical: heightPercentage(spacing.md),
    borderRadius: radius.pill,
    backgroundColor: colors.bgInverse,
  },
  buttonText: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.base),
    color: colors.textInverse,
  },
});
