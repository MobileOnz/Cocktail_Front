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

import axios from 'axios';
import {API_BASE_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import { RootStackParamList } from "../Navigation/Navigation";

import {useToast} from '../Components/ToastContext';

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

const consumerKey = "Oc17d0i2lHxKxHhTqL1C";
const consumerSecret = "PgG9qhIBZP";
const appName = "onz";
const serviceUrlScheme = "naverlogin";


type LoginScreenProps = StackScreenProps<RootStackParamList, "Login">;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const {showToast} = useToast();


  //네이버 로그인 초기 설정.

  useEffect(() => {
     GoogleSignin.configure({
      offlineAccess: true,
        webClientId:
          '1058340377075-vt8u6qabph0f0van79eqhkt9j2f1jkbe.apps.googleusercontent.com',
        iosClientId:
          '1058340377075-an8fq49j4mg29fq9rm88qpi253dd2vts.apps.googleusercontent.com',
     });
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


  //네이버 로그인
  const naverLogin = async (): Promise<void> => {
    try {
      const { failureResponse, successResponse } = await NaverLogin.login();
      setSuccessResponse(successResponse);
      setFailureResponse(failureResponse);

      if (successResponse) {
        const { accessToken} = successResponse;
        const payload = {
          provider: 'naver',
          accessToken : accessToken,
        };
        const response = await axios.post(`${server}/api/auth/social-login`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const code = response.data.data.code;
        if(code){
          navigation.navigate("SignupScreen",{code : code})
        }else{
          //여기서 토큰을 발행함. 만약 새로운 유저가 가입을 한 것이라면 SignupScreen에 code값을 담아 옮겨주면 된다. 
          const backendAccessToken = response.data.data.access_token;
          const backendRefreshToken = response.data.data.refresh_token;
          console.log("backendAccessToken: ",backendAccessToken);
        if (backendAccessToken) {
          await AsyncStorage.setItem('accessToken', backendAccessToken);
          showToast("로그인 되었습니다.");
          
          //로그인을 수행하고 돌아왔을 때도 refresh를 수행해주기 위함
          navigation.navigate("BottomTabNavigator", {
            screen: "지도", // Tab name
            params: { shouldRefresh: true }, // Maps 컴포넌트로 전달할 route.params
          });
        }
        if (backendRefreshToken) {
          await AsyncStorage.setItem('refreshToken', backendRefreshToken);
        }
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
  const kakaoLogin = () => {
    KakaoLogin.login()
    
    .then(async (result) => {
      console.log("Login Success", JSON.stringify(result));

      const accessToken = result.accessToken;
      const payload = {
        provider: 'kakao',
        accessToken : accessToken,
      };
     
      const response = await axios.post(`${server}/api/auth/social-login`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        
      });
      const code = response.data.data.code;
      if(code){
        navigation.navigate("SignupScreen",{code : code})
      }else{
        //여기서 토큰을 발행함. 만약 새로운 유저가 가입을 한 것이라면 SignupScreen에 code값을 담아 옮겨주면 된다. 
        const backendAccessToken = response.data.data.access_token;
        const backendRefreshToken = response.data.data.refresh_token;
        console.log("backendAccessToken: ",backendAccessToken);
      if (backendAccessToken) {
        await AsyncStorage.setItem('accessToken', backendAccessToken);
        showToast("로그인 되었습니다.");
      }
      if (backendRefreshToken) {
        console.log(backendRefreshToken);
        await AsyncStorage.setItem('refreshToken', backendRefreshToken);
      }
      // navigation.navigate("BottomTabNavigator");
      //로그인을 수행하고 돌아왔을 때도 refresh를 수행해주기 위함
      navigation.navigate("BottomTabNavigator", {
        screen: "지도", // Tab name
        params: { shouldRefresh: true }, // Maps 컴포넌트로 전달할 route.params
      });
    }


      })
      .catch((error) => {
        if (error.code === "E_CANCELLED_OPERATION") {
          console.log("Login Cancel", error.message);
        } else {
          console.log(`Login Fail(code:${error.code})`, error.message);
        }
      });
  };


  const debugDelete = async () => {
    try{
      const accessToken = await AsyncStorage.getItem("accessToken");
      console.log("현재 accessToken:", accessToken);
      try{
        const tagResponse = await axios.delete(`${API_BASE_URL}/api/delete/member`, {
          headers: { Authorization: `${accessToken}` },
        });
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        
      }catch(error) {
        if (accessToken) {
          if (axios.isAxiosError(error)) {
            console.error({accessToken});
            console.error("서버 응답:", error.response?.data);
          } else {
            console.error("저장 중 에러:", error);
          }
        
        } else {
          console.log("정상적으로 탈퇴 되었습니다.");
        }
      }
      
    }catch(Exception){
      console.log("AccessToken이 없습니다");
    }
  }



      //구글 로그인 
  // const signInWithGoogle = async () => {
  //   try {
  //     const accessToken = (await GoogleSignin.getTokens()).accessToken;

  //     const payload = {
  //       provider: 'google',
  //       code: null,
  //       state: null,
  //       accessToken : accessToken,
  //     };
      
  //     const response = await axios.post(`${server}/api/auth/social-login`, payload, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
        
  //     });
  //     const code = response.data.data.code;
  //     if(code){
  //       navigation.navigate("SignupScreen",{code : code})
  //     }else{
  //       //여기서 토큰을 발행함. 만약 새로운 유저가 가입을 한 것이라면 SignupScreen에 code값을 담아 옮겨주면 된다. 
  //       const backendAccessToken = response.data.data.access_token;
  //       const backendRefreshToken = response.data.data.refresh_token;
  //       console.log("backendAccessToken: ",backendAccessToken);
  //     if (backendAccessToken) {
  //       await AsyncStorage.setItem('accessToken', backendAccessToken);
  //     }
  //     if (backendRefreshToken) {
  //       await AsyncStorage.setItem('refreshToken', backendRefreshToken);
  //     }
  //     navigation.navigate("BottomTabNavigator");
  //     }
      
  //   } catch (error) {
  //     console.log('Google Sign-In Error:', JSON.stringify(error, null, 2));
  //   }
  // };
  const signInWithGoogle = async () => {
    try {
      // 1. 플레이서비스 체크 (Android용이지만 iOS에서도 무방)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  
      // 2. 로그인 UI 띄우기
      const userInfo = await GoogleSignin.signIn();
  
      // 3. 로그인 성공했으면 토큰 가져오기
      const { accessToken } = await GoogleSignin.getTokens();
  
      console.log("✅ 구글 로그인 성공, accessToken:", accessToken);
  
      // 4. 서버로 소셜 로그인 요청 보내기
      const payload = {
        provider: 'google',
        code: null,
        state: null,
        accessToken: accessToken,
      };
  
      const response = await axios.post(`${server}/api/auth/social-login`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const code = response.data.data.code;
      if (code) {
        navigation.navigate("SignupScreen", { code });
      } else {
        const backendAccessToken = response.data.data.access_token;
        const backendRefreshToken = response.data.data.refresh_token;
  
        if (backendAccessToken) {
          await AsyncStorage.setItem('accessToken', backendAccessToken);
        }
        if (backendRefreshToken) {
          await AsyncStorage.setItem('refreshToken', backendRefreshToken);
        }
        navigation.navigate("BottomTabNavigator");
      }
    } catch (error) {
      console.error('❌ Google Sign-In Error:', JSON.stringify(error, null, 2));
    }
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
        <TouchableOpacity style={styles.loginButton} onPress={kakaoLogin}>
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
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={debugDelete}
          >
          <Text>디버깅용 버튼</Text>
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