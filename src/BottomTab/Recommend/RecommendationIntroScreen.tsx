// RecommendationIntroScreen.tsx
// 홈의 '나에게 맞는 칵테일 추천 받기' → 여기 → RecommendationScreen(웹뷰 문답).
//
// 이력: 원래는 밝은 그라데이션 배경에 잔 아이콘이 화면 높이의 절반을 차지하고,
// 본문은 가운데 정렬, 버튼은 absolute 로 바닥에 붙어 있었다. 앱이 밤 테마로 바뀌면서
// 이 화면만 밝은 채로 남아 눈에 띄게 겉돌았고, 무엇을 하는 화면인지도 읽히지 않았다.
// → 배경/서체를 앱 토큰으로 맞추고, 정렬을 다른 화면과 같은 좌측 거터에 세웠다.
//   잔 실루엣은 화면을 채우는 히어로가 아니라 제목 위의 작은 표식으로 내린다.
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AccessibilityInfo,
  Animated,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../Navigation/Navigation';
import {fontPercentage, widthPercentage} from '../../assets/styles/FigmaScreen';
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
  const opacity = useRef(new Animated.Value(1)).current;
  const [index, setIndex] = useState(0);
  const [stillness, setStillness] = useState(false);

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
    if (stillness) {
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
  }, [opacity, stillness]);

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
    <View style={[styles.screen, {paddingTop: insets.top}]}>
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

      <View style={styles.body}>
        <Animated.Image
          source={GLASSES[index]}
          resizeMode="contain"
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={[styles.glass, {opacity}]}
        />

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
      </View>

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
    width: widthPercentage(40),
    height: widthPercentage(40),
    marginLeft: space.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: widthPercentage(24),
    height: widthPercentage(24),
    tintColor: night.text,
  },
  pressed: {
    opacity: 0.7,
  },
  body: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: space.gutter,
    paddingBottom: space.xxxl,
  },
  // 제목 위 표식. 예전의 400pt 짜리 히어로가 아니라, 제목에 딸린 크기로 둔다.
  glass: {
    width: widthPercentage(64),
    height: widthPercentage(64),
    marginLeft: -space.xs,
    marginBottom: space.xl,
    tintColor: night.accent,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(28),
    lineHeight: fontPercentage(40),
    color: night.text,
  },
  lead: {
    marginTop: space.md,
    fontFamily: fonts.regular,
    fontSize: fontPercentage(15),
    lineHeight: fontPercentage(24),
    color: night.textDim,
  },
  footer: {
    paddingHorizontal: space.gutter,
  },
  cta: {
    height: 52,
    borderRadius: round.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: night.accent,
    overflow: 'hidden',
  },
  ctaText: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(16),
    color: night.onAccent,
  },
});
