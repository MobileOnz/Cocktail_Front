import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  heightPercentage,
  widthPercentage,
  fontPercentage,
} from "../assets/styles/FigmaScreen";
import {useNavigation} from "@react-navigation/native";


const SignupScreen = () => {

  const navigation = useNavigation();
  const [nickname, setNickname] = useState("");
  const [agreements, setAgreements] = useState({
    all: false,
    age: false,
    terms: false,
    marketing: false,
    ads: false,
  });
  const [detailsVisible, setDetailsVisible] = useState({
    age: false,
    terms: false,
    marketing: false,
    ads: false,
  });

  const handleCheckboxChange = (key: keyof typeof agreements) => {
    if (key === "all") {
      const newState = !agreements.all;
      setAgreements({
        all: newState,
        age: newState,
        terms: newState,
        marketing: newState,
        ads: newState,
      });
    } else {
      const newAgreements = { ...agreements, [key]: !agreements[key] };
      newAgreements.all =
        newAgreements.age &&
        newAgreements.terms &&
        newAgreements.marketing &&
        newAgreements.ads;
      setAgreements(newAgreements);
    }
  };

  const toggleDetails = (key: keyof typeof detailsVisible) => {
    setDetailsVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isButtonDisabled = !(agreements.age && agreements.terms);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity style={styles.backButton}>
        <Image
          source={require("../assets/drawable/left-chevron.png")}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      {/* 회원가입 안내 */}
      <Text style={styles.title}>회원 가입</Text>

      <Text style={styles.welcomeTitle}>온즈에 오신 것을 환영합니다!</Text>
      <Text style={styles.description}>
        원활한 서비스 이용을 위해 닉네임을 설정하고{"\n"}아래 약관에 동의해 주세요.
      </Text>

      {/* 닉네임 입력 */}
      <Text style={styles.label}>닉네임</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="닉네임을 입력하세요"
          placeholderTextColor="#E4DFD8"
          value={nickname}
          onChangeText={setNickname}
        />
        {nickname.length > 0 && (
          <TouchableOpacity onPress={() => setNickname("")}>
            <Image
              source={require("../assets/drawable/close.png")}
              style={styles.clearIcon}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 약관 동의 */}
      <View style={styles.agreementContainer}>
        {/* 모든 약관 동의 */}
        <TouchableOpacity
          style={styles.agreementItem}
          onPress={() => handleCheckboxChange("all")}
        >
          <Image
            source={
              agreements.all
                ? require("../assets/drawable/checkbox_checked.png")
                : require("../assets/drawable/checkbox_unchecked.png")
            }
            style={styles.checkbox}
          />
          <Text style={styles.agreementText}>모든 약관에 동의합니다</Text>
        </TouchableOpacity>

        {/* 개별 약관 동의 */}
        {[
          { key: "age", text: "(필수) 만 14세 이상입니다" },
          { key: "terms", text: "(필수) 서비스 이용약관" },
          { key: "marketing", text: "(선택) 마케팅 활용 동의" },
          { key: "ads", text: "(선택) 광고성 정보 수신 동의" },
        ].map(({ key, text }) => (
          <View key={key}>
            <TouchableOpacity
              style={styles.agreementItem}
              onPress={() => handleCheckboxChange(key as keyof typeof agreements)}
            >
              <Image
                source={
                  agreements[key as keyof typeof agreements]
                    ? require("../assets/drawable/checkbox_checked.png")
                    : require("../assets/drawable/checkbox_unchecked.png")
                }
                style={styles.checkbox}
              />
              <Text style={styles.individualAgreementText}>{text}</Text>
              <TouchableOpacity onPress={() => toggleDetails(key as keyof typeof detailsVisible)}>
                <Image
                  source={require("../assets/drawable/chevron.png")}
                  style={[
                    styles.arrowIcon,
                    detailsVisible[key as keyof typeof detailsVisible] && styles.arrowRotated,
                  ]}
                />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* 약관 상세 내용 */}
            {detailsVisible[key as keyof typeof detailsVisible] && (
              <View style={styles.detailBox}>
                <Text style={styles.detailText}>
                  {text}에 대한 자세한 내용입니다. 여기에 약관 내용을 넣으세요.
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* 시작하기 버튼 */}
      <TouchableOpacity
        style={[styles.startButton, isButtonDisabled && styles.startButtonDisabled]}
        disabled={isButtonDisabled}
        onPress= {()=> navigation.navigate("BottomTabNavigator")}
      >
        <Text
          style={[
            styles.startButtonText,
            isButtonDisabled && styles.startButtonTextDisabled,
          ]}
        >
          시작하기
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingTop: heightPercentage(80), // 🔥 전체적인 위치 조정
      paddingHorizontal: widthPercentage(16),
      backgroundColor: "#FFFFFF",
    },
    backButton: {
      position: "absolute",
      top: heightPercentage(15), // 🔥 더 위로 조정
      left: widthPercentage(16),
    },
    backIcon: {
      width: widthPercentage(12),
      height: heightPercentage(23),
      marginTop: heightPercentage(68),
    },
    title: {
      fontSize: fontPercentage(20),
      fontWeight: "bold",
      color: "#2D2D2D",
      textAlign: "center",
      marginBottom: heightPercentage(10),
    },
    welcomeTitle: {
      fontSize: fontPercentage(20),
      fontWeight: "bold",
      color: "#2D2D2D",
      marginBottom: heightPercentage(5),
      marginTop: heightPercentage(40),
      textAlign: "left",
    },
    description: {
      fontSize: fontPercentage(16),
      color: "#2D2D2D",
      marginBottom: heightPercentage(25), // 🔥 간격 조정
      textAlign: "left",
    },
    label: {
      fontSize: fontPercentage(12),
      color: "#7D7A6F",
      marginBottom: heightPercentage(5),
      marginTop: heightPercentage(15),
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#E4DFD8",
      marginBottom: heightPercentage(30), // 🔥 약관 동의와 간격 조정
    },
    input: {
      flex: 1,
      fontSize: fontPercentage(16),
      color: "#2D2D2D",
      paddingVertical: heightPercentage(10),
    },
    clearIcon: {
      width: widthPercentage(16),
      height: heightPercentage(16),
    },
    agreementContainer: {
      backgroundColor: "#F9F8F6",
      padding: widthPercentage(16), // 🔥 좌우 패딩 조정
      borderRadius: 10,
      marginTop: heightPercentage(30), // 🔥 닉네임 필드와 간격 조정
    },
    agreementItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: heightPercentage(10),
    },
    checkbox: {
      width: widthPercentage(20),
      height: widthPercentage(20),
      marginRight: widthPercentage(10),
    },
    agreementText: {
      fontSize: fontPercentage(16),
      color: "#2D2D2D",
      fontWeight: "bold",
    },
    individualAgreementText: {
      fontSize: fontPercentage(14),
      color: "#2D2D2D",
      flex: 1,
    },
    arrowIcon: {
      width: widthPercentage(20),
      height: widthPercentage(20),
    },
    arrowRotated: {
      transform: [{ rotate: "90deg" }],
    },
    startButton: {
      backgroundColor: "#21103C",
      borderRadius: 10,
      paddingVertical: heightPercentage(12),
      alignItems: "center",
      marginTop: heightPercentage(50), // 🔥 약관 동의 박스와 버튼 간격 조정
    },
    startButtonDisabled: {
      backgroundColor: "#f3efe6",
    },
    startButtonText: {
      fontSize: fontPercentage(16),
      color: "#FFFFFF",
    },
    startButtonTextDisabled: {
      color: "#B9B6AD",
    },
    detailBox: {
      padding: widthPercentage(10),
      backgroundColor: "#E4DFD8",
      borderRadius: 5,
    },
    detailText: {
      fontSize: fontPercentage(14),
      color: "#2D2D2D",
    },
  });
  

export default SignupScreen;
