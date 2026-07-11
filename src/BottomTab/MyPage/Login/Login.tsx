
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, Platform, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { heightPercentage, widthPercentage, fontPercentage } from '../../../assets/styles/FigmaScreen';
import { RootStackParamList } from '../../../Navigation/Navigation';
import { useToast } from '../../../Components/ToastContext';
import AuthViewModel from './AuthViewModel';
import { AuthError, AuthErrorType } from '../../../model/domain/AuthError';
import Icon from 'react-native-vector-icons/Ionicons';
type LoginScreenProps = StackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route }) => {
  let redirectTo = route.params?.redirect;
  const { showToast } = useToast();
  const { loginWithNaver, loginWithKakao, loginWithGoogle, loginWithApple } = AuthViewModel();

  const naverLogin = async () => {
    try {
      const result = await loginWithNaver();

      if (result.type === 'token') {
        showToast('로그인하였습니다.');

        if (redirectTo === 1) {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'BottomTabNavigator',
                params: {
                  screen: '홈',
                },
              },
              { name: 'RecommendationIntro' }],
          });
          return;

        }

        navigation.navigate('BottomTabNavigator', {
          screen: '홈',
          params: { shouldRefresh: true },
        });
        return;
      }

      if (result.type === 'signup') {
        navigation.navigate('SignupScreen', {
          code: result.signupCode,
        });
        return;
      }

    } catch (error) {
      if (error instanceof AuthError) {
        if (error.type === AuthErrorType.CANCELLED) { return; }
        switch (error.type) {
          case AuthErrorType.TOKEN_EXPIRED:
            showToast('로그인이 만료되었습니다.');
            break;
          case AuthErrorType.SOCIAL_LOGIN_FAILED:
            showToast('소셜 로그인에 실패했습니다.');
            break;
          default:
            showToast('로그인에 실패했습니다.');
        }
        return;
      }
      showToast('알 수 없는 오류가 발생했습니다.');
    }
  };

  const kakaoLogin = async () => {
    try {
      const result = await loginWithKakao();
      if (result.type === 'token') {
        showToast('로그인하였습니다.');

        if (redirectTo === 1) {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'BottomTabNavigator',
                params: {
                  screen: '홈',
                },
              },
              { name: 'RecommendationIntro' }],
          });
          return;
        }

        navigation.navigate('BottomTabNavigator', {
          screen: '홈',
          params: { shouldRefresh: true },
        });
        return;
      }

      if (result.type === 'signup') {
        navigation.navigate('SignupScreen', {
          code: result.signupCode,
        });
        return;
      }

    } catch (error) {
      if (error instanceof AuthError) {
        if (error.type === AuthErrorType.CANCELLED) { return; }
        switch (error.type) {
          case AuthErrorType.TOKEN_EXPIRED:
            showToast('로그인이 만료되었습니다.');
            break;
          case AuthErrorType.SOCIAL_LOGIN_FAILED:
            showToast('소셜 로그인에 실패했습니다.');
            break;
          default:
            showToast('로그인에 실패했습니다.');
        }
        return;
      }
      showToast('알 수 없는 오류가 발생했습니다.');
    }
  };


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
      if (result.type === 'token') {
        showToast('로그인하였습니다.');

        if (redirectTo === 1) {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'BottomTabNavigator',
                params: {
                  screen: '홈',
                },
              },
              { name: 'RecommendationIntro' }],
          });
          return;
        }

        navigation.navigate('BottomTabNavigator', {
          screen: '홈',
          params: { shouldRefresh: true },
        });
        return;
      }

      if (result.type === 'signup') {
        navigation.navigate('SignupScreen', {
          code: result.signupCode,
        });
        return;
      }

    } catch (error) {
      if (error instanceof AuthError) {
        if (error.type === AuthErrorType.CANCELLED) { return; }
        switch (error.type) {
          case AuthErrorType.TOKEN_EXPIRED:
            showToast('로그인이 만료되었습니다.');
            break;
          case AuthErrorType.SOCIAL_LOGIN_FAILED:
            showToast('소셜 로그인에 실패했습니다.');
            break;
          default:
            showToast('로그인에 실패했습니다.');
        }
        return;
      }
      showToast('알 수 없는 오류가 발생했습니다.');
    }
  };

  const appleLogin = async () => {
    try {
      const result = await loginWithApple();
      if (result.type === 'token') {
        showToast('로그인하였습니다.');

        if (redirectTo === 1) {
          navigation.reset({
            index: 0,
            routes: [
              { name: 'BottomTabNavigator', params: { screen: '홈' } },
              { name: 'RecommendationIntro' },
            ],
          });
          return;
        }

        navigation.navigate('BottomTabNavigator', {
          screen: '홈',
          params: { shouldRefresh: true },
        });
        return;
      }

      if (result.type === 'signup') {
        navigation.navigate('SignupScreen', {
          code: result.signupCode,
        });
        return;
      }

    } catch (error) {
      if (error instanceof AuthError) {
        if (error.type === AuthErrorType.CANCELLED) { return; }
        switch (error.type) {
          case AuthErrorType.TOKEN_EXPIRED:
            showToast('로그인이 만료되었습니다.');
            break;
          case AuthErrorType.SOCIAL_LOGIN_FAILED:
            showToast('소셜 로그인에 실패했습니다.');
            break;
          default:
            showToast('로그인에 실패했습니다.');
        }
        return;
      }
      showToast('알 수 없는 오류가 발생했습니다.');
    }
  };



  return (
    <ImageBackground
      source={require('../../../assets/drawable/mainBg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* 뒤로가기 — 앱 전체가 좌상단 화살표로 통일되어 있다 (I-08) */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="뒤로 가기"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon name="chevron-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 세로가 좁은 기기에서도 Apple 버튼이 잘리면 안 된다 (앱스토어 심사 요건).
            버튼 묶음을 absolute 로 띄우지 않고, 스크롤 가능한 흐름 안에 둔다. */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.title}>
            칵테일의 시작, 한 잔에 담긴{'\n'}새로운 경험을 발견하세요
          </Text>

          <View style={styles.spacer} />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.loginButton} onPress={kakaoLogin}>
              <Image
                source={require('../../../assets/drawable/kakao_button.png')}
                style={styles.buttonImage}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={naverLogin}>
              <Image
                source={require('../../../assets/drawable/naver_button.png')}
                style={styles.buttonImage}
              />
            </TouchableOpacity>

            {/* google로그인 버튼 */}
            {Platform.OS === 'android' && (

              <TouchableOpacity
                style={styles.loginButton}
                onPress={googleLogin}
              >
                <Image
                  source={require('../../../assets/drawable/google_button.png')}
                  style={styles.buttonImage}
                />
              </TouchableOpacity>
            )}

            {/* Apple 버튼 */}
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={[styles.loginButton, styles.appleButton]} onPress={appleLogin}>
                <Icon name="logo-apple" size={20} color="#000" style={styles.appleIcon} />
                <Text style={styles.appleButtonText}>Apple로 로그인</Text>
              </TouchableOpacity>
            )}

          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>

  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: heightPercentage(44),
    paddingHorizontal: widthPercentage(8),
  },
  backButton: {
    padding: widthPercentage(4),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: heightPercentage(24),
  },
  /** 제목과 버튼 사이를 밀어내되, 세로가 모자라면 먼저 줄어드는 건 이 여백이다. */
  spacer: {
    flex: 1,
    minHeight: heightPercentage(24),
  },
  title: {
    fontSize: fontPercentage(22),
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFFFFF',
    marginTop: heightPercentage(48),
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
    width: '100%',
    alignItems: 'center',
    paddingBottom: heightPercentage(20),
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
  appleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleIcon: {
    marginRight: 8,
  },
  appleButtonText: {
    color: '#000000',
    fontSize: fontPercentage(15),
    fontFamily: 'Pretendard-Medium',
    fontWeight: '600',
  },
});

export default LoginScreen;
