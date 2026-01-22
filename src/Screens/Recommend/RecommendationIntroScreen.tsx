import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
  Easing,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigation/Navigation';
import {
  widthPercentage,
  heightPercentage,
  fontPercentage,
} from '../../assets/styles/FigmaScreen';
// import LottieView from 'lottie-react-native';
import { LinearGradient } from 'react-native-linear-gradient';

// 4가지 칵테일 잔 아이콘
const icons = [
  require('../../assets/drawable/coupe.png'),
  require('../../assets/drawable/flute.png'),
  require('../../assets/drawable/hurricane.png'),
  require('../../assets/drawable/magarita.png'),
  require('../../assets/drawable/martini.png'),
  require('../../assets/drawable/wine.png'),
];

type RecommendationIntroScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RecommendationIntro'
>;

interface Props {
  navigation: RecommendationIntroScreenNavigationProp;
}

const RecommendationIntroScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const [currentIndex, setCurrentIndex] = useState(0);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          setCurrentIndex((prev) => (prev + 1) % icons.length);
          animate();
        });
      }, 800);
    });
  };
    animate();
  }, [opacity]);

  const handlePress = () => { //버튼 애니메이션 (누르면 움츠려들었다가 펴지는거)
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.9, // 버튼 축소
          duration: 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        navigation.navigate('RecommendationHome');
      });
    };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Gradient 바탕색 적용하기
  return (

    <LinearGradient
      colors={['#FAF1E3', '#F6E0D8', '#EDEBE4', '#F0F2EE']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* 화면 내용 */}
      <View style={styles.container}>
        {/* 뒤로가기 버튼 */}
        <TouchableOpacity
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'BottomTabNavigator',
                  params: {
                    screen: '홈',
                  },
                },
              ],
            });
          }}
          style={styles.backButton}
        >
          <Image
            source={require('../../assets/drawable/left-chevron.png')}
            style={styles.icon}
          />
        </TouchableOpacity>

        <Animated.Image
          source={icons[currentIndex]}
          resizeMode="contain"
          style={{
            opacity,
            width: '100%',
            height: heightPercentage(400),
            marginBottom: heightPercentage(50),
          }}
        />

        {/* 설명 텍스트 (페이드인 애니메이션) */}
        <Animated.View style={{ opacity: fadeAnim}}>
          <Text style={styles.descriptionFirst}>
            당신의 취향, 한 잔으로 알아볼까요?
          </Text>
          <Text style={styles.descriptionSecond}>
            오늘은 달콤하게, 내일은 상큼하게.{'\n'}지금, 당신만의 칵테일을 찾아보세요.
          </Text>
        </Animated.View>


        {/* 버튼 */}
        <Animated.View style={[
          { transform: [{ scale: buttonScale }] },
          styles.confirmButtonContainer,
        ]}>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handlePress}
          >
            <Text style={styles.confirmButtonText}>시작하기</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

export default RecommendationIntroScreen;


// TODO: 그라데이션 배경식 및 아이콘 적용 [npm install react-native-linear-gradient]
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: heightPercentage(50),
    left: widthPercentage(15),
    alignItems: 'center',
    justifyContent: 'center',
    width: widthPercentage(40),
    height: heightPercentage(40),

  },
  icon: {
    width: widthPercentage(24),
    height: widthPercentage(24),

  },
  descriptionFirst: {
    fontSize: fontPercentage(20),
    color: '#1B1B1B',
    fontWeight: '600',
    textAlign: 'center',
  },
  descriptionSecond: {
    fontSize: fontPercentage(14),
    lineHeight: fontPercentage(20),
    fontWeight: 'medium',
    textAlign: 'center',
    color: '#BDBDBD',
    marginTop: heightPercentage(8),
  },
  cocktailImage: {
    width: widthPercentage(179),
    height: heightPercentage(335),
    resizeMode: 'contain',
  },
  confirmButton: {
    width: widthPercentage(343),
    height: heightPercentage(52),
    backgroundColor: '#313131',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: heightPercentage(4),
    paddingHorizontal: widthPercentage(16),
  },
  confirmButtonText: {
    fontSize: fontPercentage(16),
    color: '#FFFFFF',
    fontWeight: '500',
  },
  confirmButtonContainer: {
    position: 'absolute',
    bottom: 52,
    alignItems: 'center',
  },
});
