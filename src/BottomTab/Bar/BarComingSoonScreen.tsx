// BarComingSoonScreen.tsx
// 바 탭이 꺼져 있는 동안(flags.BAR_TAB_ENABLED === false) 그 자리에 서는 화면.
//
// 빈 화면이나 "곧 만나요" 한 줄로 끝내지 않는다. 지금 없는 이유를 말하고,
// 온 사람이 할 수 있는 다음 행동을 하나 준다 — 막다른 길을 만들지 않는다.
import React, {useCallback} from 'react';
import {Pressable, StatusBar, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {fontPercentage} from '../../assets/styles/FigmaScreen';
import {fonts, night, round, space} from '../../lib/theme';

const BarComingSoonScreen = () => {
  const navigation = useNavigation<any>();

  const goRecipeBook = useCallback(() => {
    navigation.navigate('레시피북');
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={night.ink} />

      <View style={styles.body}>
        <Icon
          name="wine-outline"
          size={56}
          color={night.accent}
          style={styles.mark}
        />

        {/* 한글은 조사가 앞말에 붙어야 읽힌다. 기본 줄바꿈은 '메뉴와' 를 '메뉴 / 와' 로
            끊어 놓는다 — iOS 는 hangul-word, 안드로이드는 balanced 로 어절 단위로 끊는다. */}
        <Text
          style={styles.title}
          lineBreakStrategyIOS="hangul-word"
          textBreakStrategy="balanced">
          좋은 바를 제대로{'\n'}소개하려고 준비하고 있어요
        </Text>

        <Text
          style={styles.lead}
          lineBreakStrategyIOS="hangul-word"
          textBreakStrategy="balanced">
          아무 가게나 목록에 올리고 싶지 않았어요. 직접 가서 메뉴와 분위기를
          확인한 곳만 담을게요.
        </Text>
        <Text
          style={styles.lead}
          lineBreakStrategyIOS="hangul-word"
          textBreakStrategy="balanced">
          준비되면 앱에서 가장 먼저 알려드릴게요.
        </Text>

        <Pressable
          onPress={goRecipeBook}
          accessibilityRole="button"
          accessibilityLabel="레시피북 둘러보기"
          style={({pressed}) => [styles.cta, pressed && styles.pressed]}
          android_ripple={{color: 'rgba(255,255,255,0.08)'}}>
          <Text style={styles.ctaText}>그동안 레시피북 둘러보기</Text>
          <Icon name="chevron-forward" size={16} color={night.accent} />
        </Pressable>
      </View>
    </View>
  );
};

export default BarComingSoonScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: night.ink,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: space.gutter,
    // 하단 탭바가 떠 있으므로 그만큼 위로 올려 시각적 중앙을 맞춘다.
    paddingBottom: space.xxxl,
  },
  mark: {
    marginBottom: space.xl,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(26),
    lineHeight: fontPercentage(38),
    color: night.text,
  },
  lead: {
    marginTop: space.md,
    fontFamily: fonts.regular,
    fontSize: fontPercentage(15),
    lineHeight: fontPercentage(24),
    color: night.textDim,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.xs,
    marginTop: space.xxl,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    marginLeft: -space.md,
    borderRadius: round.sm,
  },
  ctaText: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(15),
    color: night.accent,
  },
  pressed: {
    opacity: 0.7,
  },
});
