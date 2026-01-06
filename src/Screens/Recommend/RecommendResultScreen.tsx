import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigation/Navigation';
import { widthPercentage, heightPercentage, fontPercentage } from '../../assets/styles/FigmaScreen';
import ResultViewModel from './ResultViewModel';

type RecommendResultSreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RecommendResultScreen'
>;

interface Props {
  navigation: RecommendResultSreenNavigationProp;
  route: any
}

const RecommendResultScreen: React.FC<Props> = ({ navigation, route }) => {
    const { result, answers } = route.params;
    const { clickCtaRecommendResult } = ResultViewModel();

    // [버튼] 한잔 더 추천받기
    const resetRecommendation = () => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'RecommendIntroScreen' }],
        });
    };

    // 칵테일 상세화면 이동
    const handleCocktailDetail = () => {
        if ( result?.id) {
          clickCtaRecommendResult(result.id, result.engName, answers);
          navigation.navigate('GuideDetailScreen', { id: result.id as number, src: result.imageUrl, title: result.korName } );
        }
    };

    return (
        <View style={styles.container}>

            {/* 상단 뷰 */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {}}
                    style={styles.icon}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} // 터치 영역 확장
                >
                    {/* <Image
                    source={require('../../assets/drawable/left-chevron.png')}
                    style={styles.icon}
                    /> */}
                </TouchableOpacity>
                <TouchableOpacity onPress={() =>
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
                    })
                }>
                    <Image source={require('../../assets/drawable/close.png')}
                    style={styles.icon} />
                </TouchableOpacity>
            </View>

            {/* 중앙 뷰 */}
            <View style={styles.centralContainer}>
                <ResultScreen data = {result}/>
            </View>

            {/* 바텀 뷰 */}
            <View style={styles.bottomContainer}>
                <View style={styles.lastButtonsWrapper}>
                    <TouchableOpacity
                        style={[styles.bottomBtnLeft]}
                        onPress={resetRecommendation}
                    >
                    <Text style={[styles.bottomBtnLeftText]}>한 잔 더 추천받기</Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.bottomBtnRight]}
                        onPress={handleCocktailDetail}
                    >
                        <Text style={[styles.bottomBtnRightText]}>이 칵테일 보기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// 결과 화면
const ResultScreen = ( {data} ) => {
  const ABV_LABEL: Record<string, string> = {
    WEAK: '약함',
    MEDIUM: '보통',
    STRONG: '강함',
  };
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;


  const flipCard = () => {
    if (isFlipped) {
      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsFlipped(false));
    } else {
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsFlipped(true));
    }
  };

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <View style={{flex:1}}>
      <Text style={styles.titleIntroduceText}>(닉네임)님, 오늘은 이 한 잔이 좋겠네요.</Text>
      <Text style={styles.description}>기분에 따라, 편하게 즐겨보세요</Text>

      <View style={{flex:1}}>
        {/* 뒤집기 아이콘 */}
        <TouchableOpacity onPress={flipCard} style={styles.flipButton}>
          <Image
            source={require('../../assets/drawable/Flip.png')}
            style={{width: widthPercentage(34), height: heightPercentage(34)}}
          />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.card,
            {
              transform: [{rotateY: frontRotate}],
            },
          ]}
        >
          <Image
            source={ {uri: data.imageUrl }}
            style={{width:'100%', height: '85%', resizeMode:'cover', borderRadius: 8}}
          />
          <Text style={styles.resultText}>
            {data.engName}
          </Text>
          <Text style={styles.resultTitleText}>
            {data.korName}
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            {
              transform: [
                {rotateY: backRotate},
              ],
            },
          ]}
        >
          <Image
            source={ {uri: data.imageUrl }}
            style={{width:'100%', height: '85%', resizeMode:'cover', borderRadius: 8, transform: [{scaleX: -1}] }}
            blurRadius={6}
          />

          <View style={styles.resultInfoContainer}>
            <View style={styles.resultInfoBox}>
              <Text style={styles.resultInfoTitleText}>도수</Text>
              <Text style={styles.resultInfoSubText}>ABV {data.minAlcohol}~{data.maxAlcohol}% {ABV_LABEL[data.abvBand]}</Text>
            </View>

            <View style={styles.resultInfoBox}>
              <Text style={styles.resultInfoTitleText}>맛</Text>
              <Text style={styles.resultInfoSubText}>{data.flavors.join(' · ')}</Text>
            </View>

            <View style={styles.resultInfoBox}>
              <Text style={styles.resultInfoTitleText}>계절</Text>
              <Text style={styles.resultInfoSubText}>{data.season}</Text>
            </View>

            <View style={styles.resultInfoBox}>
              <Text style={styles.resultInfoTitleText}>분위기</Text>
              <Text style={styles.resultInfoSubText}>{data.moods.join(' · ')}</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  resultInfoContainer: {
    position: 'absolute',
    left: widthPercentage(20),
    right: widthPercentage(20),
    bottom: 100,
  },

  resultInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: heightPercentage(5),
  },

  resultInfoTitleText: {
    flex: 1,
    fontSize: fontPercentage(14),
    color: '#BDBDBD',

  },

  resultInfoSubText: {
    flex: 4,
    fontSize: fontPercentage(16),
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'left',
    flexWrap: 'wrap',
  },

  card: {
    backfaceVisibility: 'hidden',
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  cardBack: {
    backfaceVisibility: 'hidden',
    width: '100%',
    height: '100%',
    position: 'relative',
  },

  resultText: {
    position: 'absolute',
    marginTop: heightPercentage(345),
    marginLeft: widthPercentage(20),
    fontSize: fontPercentage(20),
    color: '#FFFFFF',
    fontWeight: '700',
    fontStyle: 'italic',
  },

  resultTitleText: {
    position: 'absolute',
    marginTop: heightPercentage(378),
    marginLeft: widthPercentage(20),
    fontSize: fontPercentage(20),
    color: '#FFFFFF',
    fontWeight: '700',
  },

  titleIntroduceText: {
    fontSize: fontPercentage(20),
    color: '#1B1B1B',
    fontWeight: '600',
    textAlign: 'center',
  },

  flipButton: {
    position: 'absolute',
    top: 18,
    right: 28,
    zIndex: 10,
    width: widthPercentage(24),
    height: heightPercentage(24),
    resizeMode: 'contain',
  },

  description: {
    fontSize: fontPercentage(14),
    color: '#BDBDBD',
    fontWeight: '500',
    textAlign: 'center',
    paddingBottom: heightPercentage(20),
  },

  container: {
    flex: 1,
    backgroundColor: '#fffcf3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: heightPercentage(50),
    paddingHorizontal: widthPercentage(15),
    paddingVertical: widthPercentage(10),
  },
  icon: {
    width: widthPercentage(24),
    height: widthPercentage(24),
    resizeMode: 'contain',
  },

  centralContainer: {
    flex: 8,
    paddingVertical: heightPercentage(20),
    paddingHorizontal: heightPercentage(20),
  },

  bottomContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffcf3',
  },

  lastButtonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 10,
  },

  bottomBtnLeft: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    paddingVertical: heightPercentage(14),
    paddingHorizontal: widthPercentage(16),
    marginLeft: widthPercentage(16),
    borderRadius: 8,
    alignItems: 'center',
  },

  bottomBtnRight: {
    flex: 1,
    backgroundColor: '#313131',
    paddingVertical: heightPercentage(14),
    paddingHorizontal: widthPercentage(16),
    marginRight: widthPercentage(16),
    borderRadius: 8,
    alignItems: 'center',
  },

  bottomBtnLeftText: {
    fontWeight: '600',
    fontSize: fontPercentage(14),
    color: '#1B1B1B',
  },
  bottomBtnRightText: {
    fontWeight: '600',
    fontSize: fontPercentage(14),
    color: '#FFFFFF',
  },
});

export default RecommendResultScreen;
