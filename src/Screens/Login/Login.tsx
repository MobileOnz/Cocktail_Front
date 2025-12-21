import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, Linking } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { heightPercentage, widthPercentage, fontPercentage } from '../../assets/styles/FigmaScreen';
import { RootStackParamList } from '../../Navigation/Navigation';

import {useToast} from '../../Components/ToastContext';
import AuthViewModel from './AuthViewModel';
import { AuthError, AuthErrorType } from '../../model/domain/AuthError';

type LoginScreenProps = StackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const {showToast} = useToast();
  const { loginWithNaver, loginWithKakao, loginWithGoogle } = AuthViewModel()

  const naverLogin = async () => {
    try {
      const result = await loginWithNaver();

      if (result.type === "token") {
        showToast("로그인하였습니다.");
        navigation.navigate("BottomTabNavigator", {
          screen: "지도",
          params: { shouldRefresh: true },
        });
        return;
      }

      if (result.type === "signup") {
        navigation.navigate("SignupScreen", {
          code: result.signupCode,
        });
        return;
      }

    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case AuthErrorType.TOKEN_EXPIRED:
            showToast("로그인이 만료되었습니다.");
            break;

          case AuthErrorType.SOCIAL_LOGIN_FAILED:
            showToast("소셜 로그인에 실패했습니다.");
            break;

          default:
            showToast("로그인에 실패했습니다.");
        }
        return;
      }

      showToast("알 수 없는 오류가 발생했습니다.");
    }
  };

  const kakaoLogin = async() => {
    try {
    const result = await loginWithKakao();
    console.log(JSON.stringify(result))
    if (result.type === "token") {
      showToast("로그인하였습니다.");
      navigation.navigate("BottomTabNavigator", {
        screen: "지도",
        params: { shouldRefresh: true },
      });
      return;
    }

    if (result.type === "signup") {
      navigation.navigate("SignupScreen", {
        code: result.signupCode,
      });
      return;
    }

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case AuthErrorType.TOKEN_EXPIRED:
          showToast("로그인이 만료되었습니다.");
          break;

        case AuthErrorType.SOCIAL_LOGIN_FAILED:
          showToast("소셜 로그인에 실패했습니다.");
          break;

        default:
          showToast("로그인에 실패했습니다.");
      }
      return;
    }

    showToast("알 수 없는 오류가 발생했습니다.");
  }
}


  // const debugDelete = async () => {
  //   try{
  //     const accessToken = await AsyncStorage.getItem('accessToken');
  //     console.log('현재 accessToken:', accessToken);
  //     try{
  //       const tagResponse = await axios.delete(`${API_BASE_URL}/api/delete/member`, {
  //         headers: { Authorization: `${accessToken}` },
  //       });
  //       await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);

  //     }catch(error) {
  //       if (accessToken) {
  //         if (axios.isAxiosError(error)) {
  //           console.error({accessToken});
  //           console.error('서버 응답:', error.response?.data);
  //         } else {
  //           console.error('저장 중 에러:', error);
  //         }

  //       } else {
  //         console.log('정상적으로 탈퇴 되었습니다.');
  //       }
  //     }

  //   }catch(Exception){
  //     console.log('AccessToken이 없습니다');
  //   }
  // };



      //구글 로그인
  const googleLogin = async () => {
    try {
      const result = await loginWithGoogle();
      console.log(JSON.stringify(result))
      if (result.type === "token") {
        showToast("로그인하였습니다.");
        navigation.navigate("BottomTabNavigator", {
          screen: "지도",
          params: { shouldRefresh: true },
        });
        return;
      }

      if (result.type === "signup") {
        navigation.navigate("SignupScreen", {
          code: result.signupCode,
        });
        return;
      }

    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case AuthErrorType.TOKEN_EXPIRED:
            showToast("로그인이 만료되었습니다.");
            break;

          case AuthErrorType.SOCIAL_LOGIN_FAILED:
            showToast("소셜 로그인에 실패했습니다.");
            break;

          default:
            showToast("로그인에 실패했습니다.");
        }
        return;
      }

      showToast("알 수 없는 오류가 발생했습니다.");
    }
  };



  return (
    <ImageBackground
      source={require('../../assets/drawable/mainBg.png')}
      style={styles.background}
      resizeMode="cover"
    >
        <View style={styles.container}>
          {/* X 버튼 (닫기) */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.navigate('SignupScreen')}
          >
            <Image
              source={require('../../assets/drawable/close.png')}
              style={styles.closeIcon}
            />
          </TouchableOpacity>

        {/* 로그인 안내 문구 */}
        <Text style={styles.title}>
          칵테일의 시작, 한 잔에 담긴{'\n'}새로운 경험을 발견하세요
        </Text>

        {/* 로그인 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={kakaoLogin}>
            <Image
              source={require('../../assets/drawable/kakao_button.png')}
              style={styles.buttonImage}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={naverLogin}>
            <Image
              source={require('../../assets/drawable/naver_button.png')}
              style={styles.buttonImage}
            />
          </TouchableOpacity>

        {/* google로그인 버튼 */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={googleLogin}
            >
            <Image
              source={require('../../assets/drawable/google_button.png')}
              style={styles.buttonImage}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
    
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: heightPercentage(50),
  },
  closeButton: {
    position: 'absolute',
    top: heightPercentage(11),
    right: widthPercentage(13),
  },
  closeIcon: {
    width: widthPercentage(30),
    height: heightPercentage(30),
    marginTop: heightPercentage(50),
  },
  title: {
    fontSize: fontPercentage(22),
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFFFFF',
    marginTop: heightPercentage(92),
    lineHeight: fontPercentage(22 * 1.364),
    letterSpacing: fontPercentage(-1.94),

  },
  logo: {
    width: widthPercentage(260),
    height: heightPercentage(260),
    resizeMode: 'contain',
    marginTop: heightPercentage(20),
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 52,
    width: '100%',
    alignItems: 'center',
  },
  loginButton: {
    width: widthPercentage(343),
    height: heightPercentage(48),
    marginVertical: heightPercentage(5),
  },
  buttonImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default LoginScreen;
