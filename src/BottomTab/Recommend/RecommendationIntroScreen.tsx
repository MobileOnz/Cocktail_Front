// RecommendationIntroScreen.tsx
// 홈의 '나에게 맞는 칵테일 추천 받기' → 여기 → RecommendationScreen(웹뷰 문답).
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AccessibilityInfo,
  Animated,
  Image,
  Pressable,
  ScrollView,
  useWindowDimensions,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../Navigation/Navigation';
import {useIsFocused} from '@react-navigation/native';
import {fonts, night, round, space} from '../../lib/theme';

/** 표식으로 돌려 쓰는 잔 실루엣. 흰 단색이라 어두운 배경에서 tintColor 로 물들인다. */
const GLASSES = [
  require('../../assets/drawable/martini.png'),
  require('../../assets/drawable/coupe.png'),
  require('../../assets/drawable/hurricane.png'),
  require('../../assets/drawable/flute.png'),
];

const HOLD_MS = 1600;
const FADE_MS = 320;

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'RecommendationIntro'>;
};

const RecommendationIntroScreen: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const {width, height} = useWindowDimensions();
  const focused = useIsFocused();
  const glassSize = Math.min(width * 0.55, height * 0.3, 260);
  const opacity = useRef(new Animated.Value(1)).current;
  const [index, setIndex] = useState(0);
  const [stillness, setStillness] = useState(true);

  // 손대지 않았는데 움직이는 요소는 이 화면에 이것 하나뿐이다.
  // 모션 줄이기를 켠 사람에게는 그 하나도 멈춘다.
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then(reduced => {
      if (alive) {
        setStillness(reduced);
      }
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setStillness,
    );
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  // 예전 구현은 애니메이션 콜백 안에서 자기를 다시 부르며 setTimeout 을 쌓았고
  // 정리 경로가 없어 화면을 떠난 뒤에도 계속 돌았다. 타이머를 밖에서 쥐고 끊는다.
  useEffect(() => {
    opacity.setValue(1);
    if (stillness || !focused) {
      return;
    }
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const cycle = () => {
      timer = setTimeout(() => {
        if (!alive) {
          return;
        }
        Animated.timing(opacity, {
          toValue: 0,
          duration: FADE_MS,
          useNativeDriver: true,
        }).start(() => {
          if (!alive) {
            return;
          }
          setIndex(prev => (prev + 1) % GLASSES.length);
          Animated.timing(opacity, {
            toValue: 1,
            duration: FADE_MS,
            useNativeDriver: true,
          }).start(({finished}) => {
            if (finished && alive) {
              cycle();
            }
          });
        });
      }, HOLD_MS);
    };
    cycle();

    return () => {
      alive = false;
      clearTimeout(timer);
      opacity.stopAnimation();
    };
  }, [opacity, stillness, focused]);

  // 예전엔 뒤로가기가 홈 탭으로 navigation.reset 을 했다. 어디서 들어왔든 홈으로
  // 튕겨 나가고 스택도 날아간다. 들어온 자리로 돌려보내는 게 맞다.
  const goBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('BottomTabNavigator', {screen: '홈'});
    }
  }, [navigation]);

  const start = useCallback(() => {
    navigation.navigate('RecommendationScreen');
  }, [navigation]);

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}>
      <StatusBar barStyle="light-content" backgroundColor={night.ink} />

      <Pressable
        onPress={goBack}
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
        style={({pressed}) => [styles.back, pressed && styles.pressed]}>
        <Image
          source={require('../../assets/drawable/left-chevron.png')}
          style={styles.backIcon}
        />
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}>
        <View style={styles.artwork}>
          <Animated.Image
            source={GLASSES[index]}
            resizeMode="contain"
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={[
              styles.glass,
              {opacity, width: glassSize, height: glassSize},
            ]}
          />
        </View>

        <Text
          style={styles.title}
          lineBreakStrategyIOS="hangul-word"
          textBreakStrategy="balanced">
          오늘 기분에 맞는{'\n'}한 잔을 찾아드려요
        </Text>
        <Text
          style={styles.lead}
          lineBreakStrategyIOS="hangul-word"
          textBreakStrategy="balanced">
          질문 몇 개에 답하면{'\n'}취향에 가까운 한 잔을 골라드려요.
        </Text>
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + space.xl}]}>
        <Pressable
          onPress={start}
          accessibilityRole="button"
          accessibilityLabel="추천 받기"
          style={({pressed}) => [styles.cta, pressed && styles.pressed]}
          android_ripple={{color: 'rgba(0,0,0,0.12)'}}>
          <Text style={styles.ctaText}>추천 받기</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default RecommendationIntroScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: night.ink,
  },
  back: {
    width: 48,
    height: 48,
    marginLeft: space.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: night.text,
  },
  pressed: {
    opacity: 0.7,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: space.gutter,
    paddingBottom: space.xxxl,
  },
  artwork: {
    flexGrow: 1,
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xl,
  },
  glass: {tintColor: night.accent},
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 40,
    color: night.text,
  },
  lead: {
    marginTop: space.md,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    color: night.textDim,
  },
  footer: {
    paddingHorizontal: space.gutter,
  },
  cta: {
    minHeight: 52,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: round.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: night.accent,
    overflow: 'hidden',
  },
  ctaText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: night.onAccent,
  },
});
