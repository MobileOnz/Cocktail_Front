import React, {useEffect,useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import * as KakaoLogin from "@react-native-seoul/kakao-login";
import { heightPercentage, widthPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import NaverLogin from "@react-native-seoul/naver-login";
import type {
  GetProfileResponse,
  NaverLoginResponse,
} from "@react-native-seoul/naver-login";
import { authorize } from 'react-native-app-auth';
import axios from 'axios';
import {API_BASE_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

//env에서 서버 주소 가져옴
const server = API_BASE_URL;


//구글로그인  설정
const config = {
  issuer: 'https://accounts.google.com',
  clientId: process.env.GOOGLE_CLIENT_ID as string,
  redirectUrl: process.env.GOOGLE_REDIRECT_URI as string,
  scopes: ['openid', 'profile', 'email'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
  },
};


type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  BottomTabNavigator: undefined;
};

const consumerKey = "Oc17d0i2lHxKxHhTqL1C";
const consumerSecret = "PgG9qhIBZP";
const appName = "onz";
const serviceUrlScheme = "testapp";

type LoginScreenProps = StackScreenProps<RootStackParamList, "Login">;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  useEffect(() => {
    NaverLogin.initialize({
      appName,
      consumerKey,
      consumerSecret,
      serviceUrlSchemeIOS: serviceUrlScheme,
      disableNaverAppAuthIOS: true,
    });
    NaverLogin.logout
    NaverLogin.deleteToken
    
  }, []);

  const [success, setSuccessResponse] = useState<NaverLoginResponse['successResponse']>();

  const [failure, setFailureResponse] = useState<NaverLoginResponse['failureResponse']>();
  const [getProfileRes, setGetProfileRes] = useState<GetProfileResponse>();

 

  const naverLogin = async (): Promise<void> => {
    try {
      const { failureResponse, successResponse } = await NaverLogin.login();
  
      setSuccessResponse(successResponse);
      setFailureResponse(failureResponse);

      
  
      if (successResponse) {
        const { accessToken} = successResponse;

        console.log('✅ 서버 요청 파라미터:', {
          provider: 'naver',
          code: null,
          state: null,
          accessToken,
        });
  
        console.log('네이버 로그인 성공 응답:', successResponse);


        const payload = {
          provider: 'naver',
          code: null,
          state: null,
          accessToken : accessToken,
        };
  
        const response = await axios.post(`${server}/api/auth/social-login`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        console.log('백엔드 응답:', response.data);
        const backendAccessToken = response.data.data.access_token;
        const backendRefreshToken = response.data.data.refresh_token;
        
        if (backendAccessToken) {
          const cleanToken = backendAccessToken;
          await AsyncStorage.setItem('accessToken', cleanToken);
        }
        if (backendRefreshToken) {
          await AsyncStorage.setItem('refreshToken', backendRefreshToken);
        }

      } else if (failureResponse) {
        console.log('네이버 로그인 실패:', failureResponse);
      } else {
        setFailureResponse({ message: '로그인 정보가 없습니다.', isCancel: false });
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log('서버 응답 상태:', error.response?.status);
        console.log('서버 응답 내용:', error.response?.data);
      } else {
        console.error('네이버 로그인 중 예외 발생:', error);
      }
    }
  };
  
  // 카카오 로그인 함수
  const kakaologin = () => {
    KakaoLogin.login()
    
    .then(async (result) => {
      console.log("Login Success", JSON.stringify(result));

      const accessToken = result.accessToken;
      await fetch(`${server}/api/auth/social-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'kakao',
          code: null,
          state: null,
          accessToken,
        }),
      });
      navigation.replace('BottomTabNavigator');

      })
      .catch((error) => {
        if (error.code === "E_CANCELLED_OPERATION") {
          console.log("Login Cancel", error.message);
        } else {
          console.log(`Login Fail(code:${error.code})`, error.message);
        }
      });
  };
  const signInWithGoogle = async () => {
    try {
      const result = await authorize(config);
      const { authorizationCode } = result;

      const response = await axios.post(`${server}/api/auth/social-login`, {
        provider: 'google',
        code: authorizationCode,
        state: null,
        accessToken: null,
      });

      console.log('✅ 구글 로그인 성공:', response.data);
    } catch (error) {
      console.error('❌ 구글 로그인 실패:', error);
    }
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

      {/* 로그인 버튼 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={kakaologin}>
          <Image
            source={require("../assets/drawable/kakao_button.png")}
            style={styles.buttonImage}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={naverLogin}>
          <Image
            source={require("../assets/drawable/naver_button.png")}
            style={styles.buttonImage}
          />
        </TouchableOpacity>

      {/* google로그인 버튼 */}
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={signInWithGoogle}
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
