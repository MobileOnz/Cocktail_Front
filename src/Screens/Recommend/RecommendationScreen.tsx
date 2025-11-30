import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigation/Navigation';
import { widthPercentage, heightPercentage, fontPercentage } from '../../assets/styles/FigmaScreen';
// import instance from '../../tokenRequest/axios_interceptor';

type RecommendationSreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RecommendationScreen'
>;

interface Props {
  navigation: RecommendationSreenNavigationProp;
}



const RecommendationScreen: React.FC<Props> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([null, null, null, null]);

  // [버튼] 다음 단계 이동
  const handleConfirmBtn = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  // [버튼] 이전 단계 이동
  const handleBackBtn = () => {
    console.log(currentStep)
    if (currentStep == 0) {
      navigation.goBack()
    }
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

   const handleAnswerSelect = (answerId: number) => {
    setSelectedAnswers(prev => {
      const updated = [...prev];
      updated[currentStep] = answerId;   // 해당 단계 위치에 저장
      return updated;
    });
  }

  return (
    <View style={styles.container}>

      {/* 상단 뷰 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackBtn}
          style={styles.icon}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} // 터치 영역 확장
        >
          <Image
            source={require('../../assets/drawable/left-chevron.png')}
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('BottomTabNavigator', {screen : '맞춤 추천'})}>
            <Image source={require('../../assets/drawable/close.png')}
            style={styles.icon} />
        </TouchableOpacity>
      </View>
      
      <ProgressBar currentStep={currentStep+1} totalSteps={6} />

      {/* 중앙 뷰 */}
      <View style={styles.centralContainer}>
        {currentStep === 0 && (<Question1 currentStep={currentStep} selectedAnswers={selectedAnswers} onSelectQuestion={(answerId)=> handleAnswerSelect(answerId)}  />) }
        {currentStep === 1 && (<Question2 currentStep={currentStep} selectedAnswers={selectedAnswers} onSelectQuestion={(answerId)=> handleAnswerSelect(answerId)}  />) }
        {currentStep === 2 && (<Question3 currentStep={currentStep} selectedAnswers={selectedAnswers} onSelectQuestion={(answerId)=> handleAnswerSelect(answerId)}  />) }
        {currentStep === 3 && (<Question4 currentStep={currentStep} selectedAnswers={selectedAnswers} onSelectQuestion={(answerId)=> handleAnswerSelect(answerId)}  />) }
        {currentStep === 4 && (<Question5 currentStep={currentStep} selectedAnswers={selectedAnswers} onSelectQuestion={(answerId)=> handleAnswerSelect(answerId)}  />) }
        {currentStep === 5 && (<ResultScreen/>) }      
      </View>

    

      {/* 바텀 뷰 */}
      <View style={styles.bottomContainer}>
        {currentStep === 5 ? (
          <View style={styles.lastButtonsWrapper}>
            <TouchableOpacity 
              style={[
                styles.bottomBtnLeft,
              ]} 
              onPress={handleConfirmBtn}
            >
            <Text style={[
              styles.bottomBtnLeftText,
            ]}>한 잔 더 추천받기</Text>

            </TouchableOpacity>  
            
            <TouchableOpacity 
              style={[
                styles.bottomBtnRight,
              ]} 
              onPress={handleConfirmBtn}
            >
              <Text style={[
                styles.bottomBtnRightText,
              ]}>이 칵테일 보기</Text>

            </TouchableOpacity>  
          </View>
        ) : (
          <TouchableOpacity 
            style={[
              styles.confirmButton,
              selectedAnswers[currentStep] ? styles.activeButton : styles.disabledButton
            ]}
            onPress={handleConfirmBtn}
            disabled={selectedAnswers[currentStep] ? false : true}
          >
            <Text style={[
              styles.confirmButtonText,
            ]}>다음으로</Text>
        </TouchableOpacity>  
        )}
      </View>
    </View>
  );
};

export default RecommendationScreen;

// 1단계 질문
const Question1 = ({ currentStep, selectedAnswers, onSelectQuestion}) => {

  const questions = [
    {
      id : 1,
      title: '달콤한 맛',
      icon: require('../../assets/drawable/sweet.png')
    },
    {
      id : 2,
      title: '청량 ∙ 스파클링',
      icon: require('../../assets/drawable/questionSparkle.png')
    },
    {
      id : 3,
      title: '상큼 ∙ 시트러스',
      icon: require('../../assets/drawable/questionCitrus.png')
    },
    {
      id : 4,
      title: '과일향 ∙ 트로피컬',
      icon: require('../../assets/drawable/questionTropical.png')
    },
    {
      id : 5,
      title: '쌉싸름 ∙ 비터',
      icon: require('../../assets/drawable/questionBitter.png')
    },
    {
      id : 6,
      title: '스파이시 ∙ 따뜻한',
      icon: require('../../assets/drawable/questionSpicy.png')
    },
    {
      id : 7,
      title: '허브 ∙ 프레시',
      icon: require('../../assets/drawable/questionHerbal.png')
    },
    
  ]

  return (
    <View>
      <Text style={styles.titleIntroduceText}>오늘은 어떤 맛의 칵테일이 끌리세요?</Text>
      <Text style={styles.description}>한 가지만 선택할 수 있어요.</Text>

      <ScrollView 
        contentContainerStyle={styles.questionContainer}
        showsVerticalScrollIndicator={false}
      >
        {questions.map((question) => (
          <QuestionBox
            key={question.id}
            id={question.id}
            currentId={selectedAnswers}
            icon={question.icon}
            title={question.title}
            step={currentStep}
            onPress={() => onSelectQuestion(question.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// 2단계 질문
const Question2 = ({ currentStep, selectedAnswers, onSelectQuestion}) => {

  const questions = [
    {
      id : 1,
      title: '식전 ∙ 식후',
      icon: require('../../assets/drawable/Dining.png')
    },
    {
      id : 2,
      title: '데이트 ∙ 로맨틱',
      icon: require('../../assets/drawable/Romantic.png')
    },
    {
      id : 3,
      title: '파티 ∙ 여럿이',
      icon: require('../../assets/drawable/Together.png')
    },
    {
      id : 4,
      title: '집에서 간단히',
      icon: require('../../assets/drawable/Casual.png')
    },
    {
      id : 5,
      title: '세련된 ∙ 모던',
      icon: require('../../assets/drawable/Modern.png')
    },
    {
      id : 6,
      title: '클래식 ∙ 전통',
      icon: require('../../assets/drawable/Tradition.png')
    },
  ]

  return (
    <View>
      <Text style={styles.titleIntroduceText}>어떤 순간에 어울리는 칵테일이 좋을까요?</Text>
      <Text style={styles.description}>한 가지만 선택할 수 있어요.</Text>

      <ScrollView 
        contentContainerStyle={styles.questionContainer}
        showsVerticalScrollIndicator={false}
      >
        {questions.map((question) => (
          <QuestionBox
            key={question.id}
            id={question.id}
            currentId={selectedAnswers}
            icon={question.icon}
            title={question.title}
            step={currentStep}
            onPress={() => onSelectQuestion(question.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// 3단계 질문
const Question3 = ({ currentStep, selectedAnswers, onSelectQuestion}) => {
  const questions = [
    {
      id : 1,
      title: '봄',
      icon: require('../../assets/drawable/Spring.png')
    },
    {
      id : 2,
      title: '여름',
      icon: require('../../assets/drawable/hotWeather.png')
    },
    {
      id : 3,
      title: '가을',
      icon: require('../../assets/drawable/Autumn.png')
    },
    {
      id : 4,
      title: '겨울',
      icon: require('../../assets/drawable/Winter.png')
    },
    {
      id : 5,
      title: '계절은 상관없어요',
      icon: require('../../assets/drawable/None.png')
    },
  ]

  return (
    <View>
      <Text style={styles.titleIntroduceText}>계절도 함께 반영해드릴까요?</Text>
      <Text style={styles.description}>한 가지만 선택할 수 있어요.</Text>

      <ScrollView 
        contentContainerStyle={styles.questionContainer}
        showsVerticalScrollIndicator={false}
      >
        
        {questions.map((question) => (
          <QuestionBox
            key={question.id}
            id={question.id}
            currentId={selectedAnswers}
            icon={question.icon}
            title={question.title}
            step={currentStep}
            onPress={() => onSelectQuestion(question.id)}
          />
        ))}
      
      
      </ScrollView>
      

    </View>
  );
};

// 4단계 질문
const Question4 = ({ currentStep, selectedAnswers, onSelectQuestion}) => {

  const questions = [
    {
      id : 1,
      title: '라이트',
      subTitle: '달콤하고 가볍게 누구나 즐길 수 있는 칵테일',
      icon: require('../../assets/drawable/lightCocktail.png')
    },
    {
      id : 2,
      title: '스탠다드',
      subTitle: '기본에 충실해 언제 마셔도 무난한 칵테일',
      icon: require('../../assets/drawable/StandardCocktail.png')
    },
    {
      id : 3,
      title: '스페셜',
      subTitle: '조금 색다른 조합으로 매력적인 칵테일',
      icon: require('../../assets/drawable/SpecialCocktail.png')
    },
    {
      id : 4,
      title: '스트롱',
      subTitle: '강렬한 맛과 향이 깊은 여운을 남기는 칵테일',
      icon: require('../../assets/drawable/StrongCocktail.png')
    },
    {
      id : 5,
      title: '클래식',
      subTitle: '시간이 지나도 사랑받는 정통 스타일의 칵테일',
      icon: require('../../assets/drawable/ClassicCocktail.png')
    },
  ]

  return (
    <View>
      <Text style={styles.titleIntroduceText}>어떤 스타일을 시도해보고 싶으세요?</Text>
      <Text style={styles.description}>한 가지만 선택할 수 있어요.</Text>

      <ScrollView 
        contentContainerStyle={styles.questionContainer}
        showsVerticalScrollIndicator={false}
      >
        
        {questions.map((question) => (
          <QuestionBox
            key={question.id}
            id={question.id}
            currentId={selectedAnswers}
            icon={question.icon}
            title={question.title}
            subTitle={question.subTitle}
            step={currentStep}
            onPress={() => onSelectQuestion(question.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// 5단계 질문
const Question5 = ({ currentStep, selectedAnswers, onSelectQuestion}) => {

  const questions = [
    {
      id : 1,
      title: '약함 (ABV 5-12%)',
      subTitle: '와인·스프리츠 계열, 부담 없는 도수',
      icon: require('../../assets/drawable/weakWine.png')
    },
    {
      id : 2,
      title: '보통 (ABV 13-25%)',
      subTitle: '하이볼·진토닉, 가장 대중적인 도수',
      icon: require('../../assets/drawable/normalWine.png')
    },
    {
      id : 3,
      title: '강함 (ABV 26% 이상)',
      subTitle: '조위스키·진 베이스의 클래식 칵테일',
      icon: require('../../assets/drawable/strongWine.png')
    },
  ]

  return (
    <View>
      <Text style={styles.titleIntroduceText}>마지막으로, 어느 정도 도수가 좋으세요?</Text>
      <Text style={styles.description}>한 가지만 선택할 수 있어요.</Text>
      <ScrollView 
        contentContainerStyle={styles.questionContainer}
        showsVerticalScrollIndicator={false}
      >
        {questions.map((question) => (
          <QuestionBox
            key={question.id}
            id={question.id}
            currentId={selectedAnswers}
            icon={question.icon}
            title={question.title}
            subTitle={question.subTitle}
            step={currentStep}
            onPress={() => onSelectQuestion(question.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// 결과 화면
const ResultScreen = () => {
  const [isFlipped, setIsFlipped] = useState(false)
  const flipAnim = useRef(new Animated.Value(0)).current

  const flipCard = () => {
    if (isFlipped) {
      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start(() => setIsFlipped(false))
    } else {
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start(() => setIsFlipped(true))
    }
  }

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  })

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg']
  })

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
              transform: [{rotateY: frontRotate}]
            }
          ]}
        >
          <Image
            source={require('../../assets/drawable/cocktailBellini.png')} 
            style={{width:'100%', height: '85%', resizeMode:'cover', borderRadius: 8}}
          />
          <Text style={styles.resultText}>
            Trinidad Sour
          </Text>
          <Text style={styles.resultTitleText}>
            트리니디드 사워
          </Text>
        </Animated.View>
        
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            {
              transform: [
                {rotateY: backRotate},
              ]
            }
          ]}
        >
          <Image
            source={require('../../assets/drawable/cocktailBellini.png')} 
            style={{width:'100%', height: '85%', resizeMode:'cover', borderRadius: 8, transform: [{scaleX: -1}] }}
            blurRadius={6}
          />

          <View style={[styles.resultInfoContainer, {width: '80%'}]}>
            <View style={styles.resultInfoBox}>
              <Text style={styles.resultInfoTitleText}>도수</Text>
              <Text style={styles.resultInfoSubText}>ABV 18-20% 보통</Text>
            </View>

            <View style={styles.resultInfoBox}>
              <Text style={styles.resultInfoTitleText}>맛</Text>
              <Text style={styles.resultInfoSubText}>쌉쌀한 </Text>
            </View>

            <View style={styles.resultInfoBox}>
              <Text style={styles.resultInfoTitleText}>계절</Text>
              <Text style={styles.resultInfoSubText}>사계절</Text>
            </View>

            <View style={styles.resultInfoBox}>
              <Text style={styles.resultInfoTitleText}>분위기</Text>
              <Text style={styles.resultInfoSubText}>독특한</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};


const QuestionBox = ({id, currentId, icon, title, subTitle, step, onPress }) => {
  console.log(id, subTitle)

  let boxStyle = styles.commonInnerBox

  if (currentId[step] != null) {
    boxStyle = id === currentId[step] ? styles.activeInnerBox : styles.disabledInnerBox
  } 
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.5}>
    
      <View style={boxStyle}>
        
        <Image source={icon} style={styles.icon} />

          <View>
            <Text style={styles.question}>{title}</Text>
            {subTitle !== '' && subTitle !== undefined && subTitle !== null && (
              <Text style={styles.subquestion}>{subTitle}</Text>
            )}
          </View>

      </View>
    </TouchableOpacity> 
  );
};

const ProgressBar = ({ currentStep, totalSteps }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep,
      duration: 300,
      useNativeDriver: false
    }).start();
  }, [currentStep]);

  return (
    <View style={styles.progressContainer}>
      <Animated.View
        style={[
          styles.progressBar,
          {
            width: progressAnim.interpolate({
              inputRange: [0, totalSteps],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  
  flipButton: {
    position: 'absolute',
    top: 18,
    right: 28,
    zIndex: 10,
    width: widthPercentage(24),
    height: heightPercentage(24),
    resizeMode: 'contain',
  },
  
  centralContainer: {
    flex: 8,
    paddingVertical: heightPercentage(20),
    paddingHorizontal: heightPercentage(20),   
  },

  question: {
    fontSize: fontPercentage(16),
    fontWeight: '500',
    color: '#1B1B1B',
    marginLeft: widthPercentage(12)
  },

  subquestion: {
    fontSize: fontPercentage(12),
    fontWeight: '300',
    color: '#616161',
    marginLeft: widthPercentage(12)
  },

  confirmButton: {
    backgroundColor: '#313131',
    justifyContent: 'center',
    borderRadius: 8,
    width: '90%',
    height: heightPercentage(52),
  },

  disabledButton: {
    width: '90%',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },

  activeButton: {
    width: '90%',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#313131',
  },

  confirmButtonText: {
    fontSize: fontPercentage(16),
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },

  bottomContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffcf3'
  },

  titleIntroduceText: {
    fontSize: fontPercentage(20),
    color: '#1B1B1B',
    fontWeight: '600',
    textAlign: 'center',
  },

  description: {
    fontSize: fontPercentage(14),
    color: '#BDBDBD',
    fontWeight: '500',
    textAlign: 'center',
    paddingBottom: heightPercentage(20)
  },

  commonInnerBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: heightPercentage(12),
    paddingHorizontal: widthPercentage(16),
    marginTop: heightPercentage(8)
  },

  disabledInnerBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: heightPercentage(12),
    paddingHorizontal: widthPercentage(16),
    marginTop: heightPercentage(8),
    backgroundColor: '#F5F5F5',

  },

  activeInnerBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#1B1B1B',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: heightPercentage(12),
    paddingHorizontal: widthPercentage(16),
    marginTop: heightPercentage(8)
  },

  questionContainer: {
    marginTop: heightPercentage(20),
    paddingBottom: heightPercentage(80)
  },

  resultText: {
    position: 'absolute',
    marginTop: heightPercentage(345),
    marginLeft: widthPercentage(20),
    fontSize: fontPercentage(20),
    color: '#FFFFFF',
    fontWeight: '700',
    fontStyle: 'italic'
  },

  resultTitleText: {
    position: 'absolute',
    marginTop: heightPercentage(378),
    marginLeft: widthPercentage(20),
    fontSize: fontPercentage(20),
    color: '#FFFFFF',
    fontWeight: '700',
  },

  lastButtonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 10
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
    alignItems: 'center'
  },

  bottomBtnRight: {
    flex: 1,
    backgroundColor: '#313131',
    paddingVertical: heightPercentage(14),
    paddingHorizontal: widthPercentage(16),
    marginRight: widthPercentage(16),
    borderRadius: 8,
    alignItems: 'center'
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

  resultInfoContainer: {
    position: 'absolute',
    left: 20,
    bottom: 100
  },

  resultInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: heightPercentage(5)
  },

  resultInfoTitleText: {
    fontSize: fontPercentage(14),
    color: '#BDBDBD',
    width: widthPercentage(60)
  },
  
  resultInfoSubText: {
    fontSize: fontPercentage(16),
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: widthPercentage(8)
  },

  progressContainer: {
    height: heightPercentage(4),
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    borderRadius: 20,
    marginVertical: heightPercentage(8)
  },

  progressBar: {
    height: '100%',
    backgroundColor: '#21103C',
    borderRadius: 20,
  },

});