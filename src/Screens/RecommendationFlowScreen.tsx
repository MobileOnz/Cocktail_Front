import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
  Easing
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";


type RecommendationFlowScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RecommendationFlow"
>;

interface Props {
  navigation: RecommendationFlowScreenNavigationProp;
}
const questions = [
  {
    id: 1,
    question: "어서오세요!\n(닉네임)님을 위한 오늘의 칵테일을 준비할게요. 먼저, 어떤 맛을 좋아하세요?",
    options: ["달콤한 맛", "새콤한 맛", "쌉싸름한 맛", "묵직한 맛"],
  },
  {
    id: 2,
    question: "좋아요!\n어떤 종류의 단맛이 끌리시나요?",
    options: ["부드럽고 크리미한 단 맛", "진한 캐러멜 같은 단 맛", "가볍고 상큼한 단 맛"],
  },
  {
    id: 3,
    question: "마지막으로,\n오늘 어느 정도 도수가 괜찮으세요?",
    options: ["가볍게 마시고 싶어요", "적당히 취하고 싶어요", "높은 도수가 좋아요"],
  },
];

const RecommendationFlowScreen: React.FC<Props> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [allAnswered, setAllAnswered] = useState(false);

  const slideUpValues = useRef(questions.map(() => new Animated.Value(0))).current;
  const typingBubbleOpacity = useRef(new Animated.Value(1)).current;
  const fadeInValues = useRef(questions.map(() => new Animated.Value(0))).current;
  
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handlePress = () => { //버튼 애니메이션 (누르면 움츠려들었다가 펴지는거)
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95, // 버튼 축소
        duration: 50, 
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 50,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate("LoadingScreen");
    });
  };

  useEffect(() => {
    setAllAnswered(Object.keys(selectedAnswers).length === questions.length);
  }, [selectedAnswers]);

//   const fadeInStatusRef = useRef<boolean[]>(questions.map(() => false));
//   const fadeInCompletedRef = useRef<boolean[]>(questions.map(() => false));

  
const [isTyping, setIsTyping] = useState(false);



// 고정된 높이 설정
const typingBubbleHeights = [
    heightPercentage(314), // 초기 높이 및 첫 번째 질문 높이
    heightPercentage(240), // 두 번째 질문 높이
    heightPercentage(240), // 세 번째 질문 높이
  ];



  useEffect(() => {
    if (currentStep === -1) {
        setIsTyping(true);
        typingBubbleOpacity.setValue(0); // 초기값을 0으로 설정하여 페이드인 시작
      
        fadeInValues[0].setValue(0);
        // 페이드인 애니메이션
        Animated.timing(typingBubbleOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start(() => {
            Animated.sequence([
                Animated.delay(1000),
                Animated.timing(typingBubbleOpacity, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setCurrentStep(0);
                setIsTyping(false);

                fadeInValues[0].setValue(0);
                Animated.timing(fadeInValues[0], {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            });
        });
    }
}, []);



useEffect(() => {
    if (currentStep >= 0 && currentStep < questions.length && isTyping) {
        typingBubbleOpacity.setValue(0);

        Animated.timing(typingBubbleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
            Animated.sequence([
              Animated.timing(typingBubbleOpacity, {
                  toValue: 1,
                  duration: 500,
                  useNativeDriver: true,
              }),
              Animated.delay(500),
              Animated.timing(typingBubbleOpacity, {
                  toValue: 0,
                  duration: 500,
                  useNativeDriver: true,
              }),
          ]).start(() => {
              if (currentStep < questions.length) {
                  fadeInValues[currentStep].setValue(0);
                  Animated.timing(fadeInValues[currentStep], {
                      toValue: 1,
                      duration: 500,
                      useNativeDriver: true,
                  }).start(() => {
                      setIsTyping(false);
                  });
              } else {
                  setIsTyping(false);
              }
          });
        });
        
    }
}, [currentStep, isTyping]);





const handleOptionSelect = (answer: string) => {
    setSelectedAnswers((prev) => ({
        ...prev,
        [currentStep]: answer,
    }));

    if (currentStep < questions.length - 1) {
        const nextStep = currentStep + 1;

        // 슬라이드 업 애니메이션
        Animated.timing(slideUpValues[currentStep], {
            toValue: -3,
            duration: 1000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
        }).start(() => {
            setIsTyping(true); // "..." 애니메이션 시작
            setCurrentStep(nextStep); // 다음 질문으로 이동
        });
    } else {
        setAllAnswered(true);
    }
};






  const handleGoBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} // 터치 영역 확장
        >
          <Image
            source={require("../assets/drawable/left-chevron.png")}
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("BottomTabNavigator")}>  
            <Image source={require("../assets/drawable/home.png")}
            style={styles.icon} />
        </TouchableOpacity>
      </View>

      <View style={styles.centralContainer}>

      {/* "..." 애니메이션 */}
      {(currentStep === -1 || (currentStep >= 0 && currentStep < questions.length)) && (
            <Animated.View
                style={[
                    styles.questionContainer,
                    { 
                        opacity: typingBubbleOpacity, 
                        height: typingBubbleHeights[currentStep === -1 ? 0 : currentStep]
                    }
            ]}
            >
                <View style={styles.questionWrapper}>
                    <Image
                        source={require("../assets/drawable/thumnail.png")}
                        style={styles.profileImage}
                    />
                    <View style={styles.typingBubble}>
                        <Image
                            source={require("../assets/drawable/chatfield.png")}
                            style={styles.chatFieldImage}
                        />
                    </View>
                </View>
            </Animated.View>
        )}

        {/* 질문과 옵션 표시 */}
        {questions.map((item, index) => (
          <Animated.View
            key={index}
            style={[
              styles.questionContainer,
              {
                opacity: fadeInValues[index],
                transform: [
                  {
                    translateY: slideUpValues[index].interpolate({
                      inputRange: [-3, -1, 1],
                      outputRange: [
                        -heightPercentage(406) * (currentStep + 1 - index), 
                        0, 
                        heightPercentage(406) * (index - currentStep)],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.questionWrapper}>
              <Image
                source={require("../assets/drawable/thumnail.png")}
                style={styles.profileImage}
              />
              <View style={styles.bubble}>
                <Text style={styles.question}>{item.question}</Text>
              </View>
            </View>

            <View style={styles.optionContainer}>
              {item.options.map((option, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.option,
                    selectedAnswers[index] === option ? styles.selectedOption : {},
                  ]}
                  onPress={() => currentStep === index && handleOptionSelect(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedAnswers[index] === option
                        ? styles.selectedOptionText
                        : {},
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        ))}

        {/* {allAnswered && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => navigation.navigate("LoadingScreen")}
          >
            <Text style={styles.confirmButtonText}>나만의 칵테일 추천 받기</Text>
          </TouchableOpacity>
        )} */}
        {currentStep === questions.length - 1 && (
          <Animated.View style={[styles.animatedButtonWrapper, { transform: [{ scale: buttonScale }] }]}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              selectedAnswers[currentStep] ? styles.activeButton : styles.disabledButton,
            ]}
            onPress={handlePress}
            disabled={!selectedAnswers[currentStep]}
          >
            <Text
              style={[
                styles.confirmButtonText,
                selectedAnswers[currentStep] ? styles.activeButtonText : styles.disabledButtonText,
              ]}
            >
              나만의 칵테일 추천 받기
            </Text>
          </TouchableOpacity>
        </Animated.View>
        )}
      </View>
    </View>
  );
};

export default RecommendationFlowScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffcf3",
  },
  backButton: {
    top: heightPercentage(10), // 🔥 값을 낮춰서 아이콘을 위로 이동
    left: widthPercentage(15),
    width: widthPercentage(40), // 적절한 크기 설정
    height: widthPercentage(40),
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: widthPercentage(15),
    marginTop: heightPercentage(50),
  },
  icon: {
    width: widthPercentage(28),
    height: widthPercentage(28),
    resizeMode: "contain",
  },
  centralContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    // paddingVertical: heightPercentage(20),
    // backgroundColor: "rgba(255,0,0,0.1)",
  },
  questionContainer: {
    position: 'absolute',
    // alignItems: "center",
    marginBottom: heightPercentage(50),
    alignItems: "flex-start",
    left: widthPercentage(15),
  },
  questionWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: heightPercentage(20),
  },
  profileImage: {
    width: widthPercentage(48),
    height: widthPercentage(48),
    borderRadius: widthPercentage(24),
    marginRight: widthPercentage(12),
  },
  bubble: {
    backgroundColor: "#F3EFE6",
    paddingVertical: heightPercentage(10),
    paddingHorizontal: widthPercentage(15),
    borderRadius: 15,
    maxWidth: widthPercentage(267),
    width: widthPercentage(267),
    flexShrink: 1,
    
  },
  question: {
    fontSize: fontPercentage(14),
    fontWeight: "500",
    color: "#2D2D2D",
    lineHeight: fontPercentage(24),
  },
  optionContainer: {
    width: "100%",
    alignItems: "flex-end",
  },
  option: {
    backgroundColor: "#F3EFE6",
    paddingVertical: heightPercentage(10),
    paddingHorizontal: widthPercentage(20),
    borderRadius: 10,
    alignItems: "center",
    marginVertical: heightPercentage(5),
  },
  selectedOption: {
    backgroundColor: "#21103C",
  },
  optionText: {
    fontSize: fontPercentage(14),
    color: "#2d2d2d",
  },
  selectedOptionText: {
    color: "#FFFFFF",
  },
  confirmButton: {
    backgroundColor: "#21103C",
    paddingVertical: heightPercentage(12),
    paddingHorizontal: widthPercentage(50),
    borderRadius: 10,
    position: 'absolute',
    bottom: heightPercentage(44), // Figma에서 제공된 하단 여백을 적용
    alignSelf: 'center',
    width: widthPercentage(343), // Figma의 버튼 너비 343px 적용
    height: heightPercentage(48), // Figma의 버튼 높이 48px 적용
},
  confirmButtonText: {
    fontSize: fontPercentage(16),
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  typingBubble: {
    backgroundColor: "#F3EFE6",
    paddingVertical: heightPercentage(10),
    paddingHorizontal: widthPercentage(15),
    borderRadius: 15,
    maxWidth: widthPercentage(267),
    flexShrink: 1,
    marginLeft: widthPercentage(12),
    height: '100%',
    
},
  chatFieldImage: {
    width: widthPercentage(60),
    height: widthPercentage(52),
    resizeMode: "contain",
  },
  disabledButton: {
    backgroundColor: "#f3efe6",
  },
  activeButton: {
    backgroundColor: "#21103C",
  },
  disabledButtonText: {
    color: "#b9b6ad",
  },
  activeButtonText: {
    color: "#FFFFFF",
  },
  animatedButtonWrapper: {
    position: "absolute",
    bottom: heightPercentage(44),
    width: "100%",
    alignItems: "center",
  },
  
});
