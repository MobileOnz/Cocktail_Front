import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import * as KakaoLogin from "@react-native-seoul/kakao-login";

import { heightPercentage, widthPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
// import NaverLogin from "@react-native-seoul/naver-login";
// import type {
//   GetProfileResponse,
//   NaverLoginResponse,
// } from "@react-native-seoul/naver-login";

type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  BottomTabNavigator: undefined;
};

const consumerKey = 'pjSp0u95mvc6Ufq_TQbP';
const consumerSecret = 'xD2ZRcw_px';
const appName = '온즈';
const serviceUrlScheme = 'navertest';

type LoginScreenProps = StackScreenProps<RootStackParamList, "Login">;

 // useEffect(() => {
  //   NaverLogin.initialize({
  //     appName,
  //     consumerKey,
  //     consumerSecret,
  //     serviceUrlSchemeIOS: serviceUrlScheme,
  //     disableNaverAppAuthIOS: true,
  //   });
  // }, []);

  // const [success, setSuccessResponse] =
  //   useState<NaverLoginResponse['successResponse']>();

  // const [failure, setFailureResponse] =
  //   useState<NaverLoginResponse['failureResponse']>();
  // const [getProfileRes, setGetProfileRes] = useState<GetProfileResponse>();

  // const naverLogin = async (): Promise<void> => {
  //   const { failureResponse, successResponse } = await NaverLogin.login();
  //   setSuccessResponse(successResponse);
  //   setFailureResponse(failureResponse);
  // };

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  // 카카오 로그인 함수
  const kakaologin = () => {
    KakaoLogin.login()
    
      .then((result) => {
        console.log("Login Success", JSON.stringify(result));
        getProfile();
      })
      .catch((error) => {
        if (error.code === "E_CANCELLED_OPERATION") {
          console.log("Login Cancel", error.message);
        } else {
          console.log(`Login Fail(code:${error.code})`, error.message);
        }
      });
  };

  // 프로필 가져오기
  const getProfile = () => {
    console.log("kakao click");
    KakaoLogin.getProfile()
      .then((result) => {
        console.log("GetProfile Success", JSON.stringify(result));
      })
      .catch((error) => {
        console.log(`GetProfile Fail(code:${error.code})`, error.message);
      });
  };

  return (
    <View style={styles.container}>
      {/* X 버튼 (닫기) */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.navigate("BottomTabNavigator")}
      >
        <Image
          source={require("../assets/drawable/close.png")}
          style={styles.closeIcon}
        />
      </TouchableOpacity>

      {/* 로그인 안내 문구 */}
      <Text style={styles.title}>
        로그인하고 우리집 근처{"\n"}칵테일 바를 찾아보세요!
      </Text>

      {/* 중앙 칵테일 잔 이미지 */}
      <Image
        source={require("../assets/drawable/login_logo.png")}
        style={styles.logo}
      />

      {/* 로그인 버튼들 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={kakaologin}>
          <Image
            source={require("../assets/drawable/kakao_button.png")}
            style={styles.buttonImage}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton}>
          <Image
            source={require("../assets/drawable/naver_button.png")}
            style={styles.buttonImage}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate("SignupScreen")}
          >
          <Image
            source={require("../assets/drawable/google_button.png")}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    paddingTop: heightPercentage(50),
  },
  closeButton: {
    position: "absolute",
    top: heightPercentage(20),
    right: widthPercentage(20),
  },
  closeIcon: {
    width: widthPercentage(18),
    height: heightPercentage(18),
    marginTop: heightPercentage(50),
  },
  title: {
    fontSize: fontPercentage(22),
    fontWeight: "700",
    textAlign: "center",
    color: "#000",
    marginTop: heightPercentage(150),

  },
  logo: {
    width: widthPercentage(260),
    height: heightPercentage(260),
    resizeMode: "contain",
    marginTop: heightPercentage(20),
  },
  buttonContainer: {
    marginTop: heightPercentage(20),
    width: "100%",
    alignItems: "center",
  },
  loginButton: {
    width: widthPercentage(343),
    height: heightPercentage(48),
    marginVertical: heightPercentage(5),
  },
  buttonImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});

export default LoginScreen;
