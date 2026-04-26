import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, ActivityIndicator, Linking, Platform } from 'react-native';
import { widthPercentage, heightPercentage, fontPercentage } from '../../assets/styles/FigmaScreen';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigation/Navigation';
import MyPageViewModel from './MyPageViewModel';
import { User } from '../../model/domain/User';
// import WithdrawBottomSheet from '../BottomSheet/WithdrawBottomSheet';
import SignOutModal from '../../Components/SignOutModal';
import WithdrawConfirmModal from '../../Components/WithdrawConfirmModal';
import { useToast } from '../../Components/ToastContext';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

// App Store Connect → My Apps → ONZ → App Information → Apple ID
const IOS_APP_STORE_ID = '6744957084';
// android applicationId — android/app/build.gradle 에 정의됨
const ANDROID_PACKAGE_NAME = 'com.cocktail_front';

//import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';


type NavigationProp = StackNavigationProp<RootStackParamList>;

const MyPageScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { showToast } = useToast();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { loading, profileUri, getMemberInfo, logOut, withDrawUser } = MyPageViewModel();

  // 앱 버전 표기 (예: v1.2.3 (45))
  const appVersionLabel = `v${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`;

  useEffect(() => {
    const fetch = async () => {
      const user = await getMemberInfo();
      if (!user) {
        setIsLoggedIn(false);
        return;
      }
      setIsLoggedIn(true);
      setUser(user);
    };

    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    try {
      const status = await logOut();
      showToast('로그아웃 되었습니다.');
      if (status === 200) {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (err) {
      console.error('🚨 로그아웃 실패:', err);
      showToast('로그아웃 실패');
    } finally {
      setShowSignOutModal(false);
    }
  };

  // 서비스 리뷰 남기기 — 네이티브 스토어로 이동
  const handleReview = async () => {
    const url = Platform.OS === 'ios'
      ? `itms-apps://itunes.apple.com/app/id${IOS_APP_STORE_ID}?action=write-review`
      : `market://details?id=${ANDROID_PACKAGE_NAME}`;
    const fallbackUrl = Platform.OS === 'ios'
      ? `https://apps.apple.com/app/id${IOS_APP_STORE_ID}?action=write-review`
      : `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(fallbackUrl);
      }
    } catch (e) {
      console.warn('🚨 리뷰 페이지 열기 실패:', e);
      try {
        await Linking.openURL(fallbackUrl);
      } catch (e2) {
        showToast('스토어 페이지를 열 수 없습니다.');
      }
    }
  };

  // 회원 탈퇴 처리
  const handleWithdraw = async () => {
    if (withdrawing) { return; }
    setWithdrawing(true);
    try {
      const code = await withDrawUser();
      if (code === 1) {
        // 토큰/캐시 정리
        await AsyncStorage.clear();
        setIsLoggedIn(false);
        setUser(null);
        setShowWithdrawModal(false);
        showToast('회원 탈퇴가 완료되었습니다.');
        // 탈퇴 직후 마이페이지(비로그인 상태)로 복귀
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'BottomTabNavigator',
              params: { screen: '마이페이지' },
            },
          ],
        });
      } else {
        showToast('탈퇴 처리 중 오류가 발생했습니다.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.msg || err?.message || '알 수 없는 오류';
      console.error('🚨 회원 탈퇴 실패:', err?.response?.data || err);
      showToast(`탈퇴 처리 중 오류: ${msg}`);
    } finally {
      setWithdrawing(false);
      setShowWithdrawModal(false);
    }
  };


  // useEffect(() => {
  //   const fetchProfileImage = async () => {
  //     try {
  //       const res = await instance.get('/api/profile', { responseType: 'blob',authOptional: true } as any);

  //       const contentType = res.headers['content-type'];

  //       if (contentType?.includes('application/json')) {
  //         const { data } = res.data;
  //         if (data) {
  //           const fullUri = data.startsWith('http') ? data : `${res.config.baseURL}${data.startsWith('/') ? '' : '/'}${data}`;
  //           setProfileImageUri(fullUri);
  //         }
  //       } else if (contentType?.startsWith('image/')) {
  //         const reader = new FileReader();
  //         reader.onloadend = () => {
  //           const base64data = reader.result as string;
  //           setProfileImageUri(base64data);
  //         };
  //         reader.readAsDataURL(res.data);
  //       }
  //     } catch (e) {
  //       console.warn('프로필 이미지 오류:', e);
  //     }
  //   };

  //   const unsubscribe = navigation.addListener('focus', fetchProfileImage);
  //   return unsubscribe;
  // }, [navigation]);

  // useEffect(() => {
  //   const checkTokenAndProfile = async () => {
  //     try {
  //       const res = await instance.get('/api/get/member', {
  //       authOptional: true,
  //       }as any);
  //       if (res.data.code === 1) {
  //         setIsLoggedIn(true);
  //         setNickname(res.data.data.nickname);
  //       } else {
  //         setIsLoggedIn(false);
  //         setNickname('');
  //         setProfileImageUri(null); // <- 프로필 초기화는 유지
  //       }
  //     } catch (err) {
  //       console.log('🚨 로그인 체크 실패:', err);
  //       setIsLoggedIn(false);
  //       setNickname('');
  //       setProfileImageUri(null);
  //     }
  //   };

  //   const unsubscribe = navigation.addListener('focus', checkTokenAndProfile);
  //   return unsubscribe;
  // }, [navigation]);



  // 현재 화면에서
  const handleLoginPress = () => {
    if (isLoggedIn) {
      navigation.navigate('ProfileScreen', { user }); // User 객체만 ProfileScreen에 전달
    } else {
      navigation.navigate('Login'); // 로그인 화면은 params 없이 이동
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.bannerAd}>
        <BannerAd
            unitId={TestIds.BANNER} // 실제 배너 ID로 교체 필요
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
            onAdLoaded={() => {
              console.log('✅ 광고 로드됨');
            }}
            onAdFailedToLoad={(error) => {
              console.log('❌ 광고 로드 실패:', error);
            }}
          />
      </View> */}
      {loading ? (
        <ActivityIndicator size="large" color="#000000ff" style={{ flex: 1 }} />
      ) : (
        <View>
          <View style={styles.topBar}>
            <Text style={styles.topTitleText}>마이페이지</Text>
          </View>

          {/* 광고 이미지 넣기*/}
          {isLoggedIn && <View style={styles.bannerAd} />}

          {/* 로그인 O */}
          {isLoggedIn ? (
            <>
              <TouchableOpacity style={styles.profileInfoContainer} onPress={handleLoginPress}>
                <Image
                  source={
                    profileUri
                      ? { uri: profileUri }
                      : require('../../assets/drawable/profile.png')}
                  style={styles.profileImage}
                />
                <Text style={styles.userNickNmText}>{user?.nickname || '사용자 닉네임'}</Text>
                <Image source={require('../../assets/drawable/right-chevron.png')} style={styles.profilerightArrow} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.cocktailBox} onPress={() => {navigation.navigate('CocktailBoxScreen' as never)}}>
                <Text style={styles.cocktailBoxText}>나의 칵테일 보관함</Text>
                <Image source={require('../../assets/drawable/bookmarkCircle.png')} style={styles.cockTailBookmark} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.loginContainer} onPress={handleLoginPress}>
              <Text style={styles.loginText}>
                {isLoggedIn ? user?.nickname : '로그인・회원가입'}
              </Text>
            </TouchableOpacity>
          )}

          {/* 광고 이미지 넣기*/}
          {!isLoggedIn && <View style={styles.bannerAd} />}



          <Text style={styles.supportTitle}>고객지원</Text>
          <View style={styles.supportSection}>
            {renderSupportItemWithValue('버전 정보', appVersionLabel)}
            <TouchableOpacity onPress={() => navigation.navigate('InquiryFormScreen')}>
              {renderSupportItem('1:1 문의하기')}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReview}>
              {renderSupportItem('서비스 리뷰 남기기')}
            </TouchableOpacity>
          </View>

          <Text style={styles.supportSecondTitle}>서비스 약관</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TermsAndConditionsScreen')}>
            {renderSupportItem('이용약관')}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicyScreen')}>
            {renderSupportItem('개인정보 처리방침')}
          </TouchableOpacity>

          {isLoggedIn && (
            <View>
              <TouchableOpacity onPress={() => setShowSignOutModal(true)}>
                {renderSupportItemWithoutIcon('로그아웃')}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowWithdrawModal(true)}
                disabled={withdrawing}
              >
                {renderWithdrawItem('회원 탈퇴')}
              </TouchableOpacity>
            </View>
          )}


          <SignOutModal
            visible={showSignOutModal}
            onClose={() => setShowSignOutModal(false)}
            onSignOut={handleLogout}
          />

          <WithdrawConfirmModal
            visible={showWithdrawModal}
            onClose={() => (withdrawing ? null : setShowWithdrawModal(false))}
            onConfirm={handleWithdraw}
          />
        </View>
      )}

    </SafeAreaView>


  );
};

const renderSupportItem = (text: string) => {
  return (
    <View style={styles.supportItem}>
      <Text style={styles.supportText}>{text}</Text>
    </View>
  );
};

const renderSupportItemWithValue = (text: string, value: string) => (
  <View style={styles.supportItem}>
    <Text style={styles.supportText}>{text}</Text>
    <Text style={styles.supportValueText}>{value}</Text>
  </View>
);

const renderSupportItemWithoutIcon = (text: string) => (
  <View style={[styles.supportItem, { marginTop: heightPercentage(8) }]}>
    <Text style={[styles.supportText, { color: '#BDBDBD' }]}>{text}</Text>
  </View>
);

const renderWithdrawItem = (text: string) => (
  <View style={styles.supportItem}>
    <Text style={[styles.supportText, { color: '#BDBDBD' }]}>{text}</Text>
  </View>
);


export default MyPageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topBar: {
    width: '100%',
    height: 52,
    paddingHorizontal: widthPercentage(16),
    paddingTop: heightPercentage(14),
    paddingBottom: heightPercentage(10),
  },
  topTitleText: {
    fontSize: fontPercentage(20),
    fontWeight: '600',
    color: '#1B1B1B',
  },
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: widthPercentage(16),
    paddingHorizontal: widthPercentage(8),
    paddingVertical: heightPercentage(14),
    height: heightPercentage(60),
    marginTop: heightPercentage(24),
  },
  profileImage: {
    width: widthPercentage(32),
    height: widthPercentage(32),
    borderRadius: widthPercentage(21),
    marginRight: widthPercentage(12),
    backgroundColor: '#DDD',
  },
  userNickNmText: {
    fontSize: fontPercentage(16),
    color: '#1B1B1B',
    fontWeight: '600',
    flex: 1,
  },
  withdrawText: {
    marginTop: heightPercentage(27),
    color: '#7D7A6F',
    textDecorationLine: 'underline',
    fontSize: fontPercentage(14),
    alignSelf: 'flex-start',
    marginLeft: widthPercentage(24),
  },
  cocktailBox: {
    flexDirection: 'row',
    alignContent: 'center',
    height: heightPercentage(52),
    marginHorizontal: widthPercentage(16),
    paddingVertical: heightPercentage(14),
    paddingHorizontal: widthPercentage(16),
    marginTop: heightPercentage(24),
    backgroundColor: '#313131',
    borderRadius: 8,
  },
  cocktailBoxText: {
    flex: 1,
    fontSize: fontPercentage(16),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loginContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: heightPercentage(16),
    height: heightPercentage(52),
    paddingHorizontal: heightPercentage(14),
    backgroundColor: '#313131',
    borderRadius: 8,
    marginTop: heightPercentage(16),
  },
  loginText: {
    fontSize: fontPercentage(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  supportTitle: {
    fontSize: fontPercentage(14),
    color: '#BDBDBD',
    fontWeight: '500',
    paddingHorizontal: widthPercentage(16),
    paddingVertical: heightPercentage(8),
    marginTop: heightPercentage(24),
    height: heightPercentage(36),
  },
  supportSecondTitle: {
    fontSize: fontPercentage(14),
    color: '#BDBDBD',
    fontWeight: '500',
    paddingHorizontal: widthPercentage(16),
    paddingVertical: heightPercentage(8),
    marginTop: heightPercentage(16),
    height: heightPercentage(36),
  },
  supportSection: {

  },
  supportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: heightPercentage(8),
    paddingHorizontal: widthPercentage(20),
  },
  supportIcon: {
    width: widthPercentage(24),
    height: widthPercentage(24),
  },
  supportText: {
    fontSize: fontPercentage(16),
    color: '#1B1B1B',
    fontWeight: '500',
  },
  supportValueText: {
    fontSize: fontPercentage(14),
    color: '#9E9E9E',
    fontWeight: '500',
  },
  profilerightArrow: {
    width: widthPercentage(24),
    height: widthPercentage(24),
  },
  cockTailBookmark: {
    width: widthPercentage(24),
    height: widthPercentage(24),
    tintColor: '#FFFFFF',
  },
  rightArrow: {
    width: widthPercentage(24),
    height: widthPercentage(24),
    alignSelf: 'flex-end',
    marginRight: widthPercentage(18),
  },
  bannerAd: {
    height: heightPercentage(56),
    alignItems: 'center',
    marginTop: heightPercentage(16),
  },
  bottomDivider: {
    height: heightPercentage(8),
    backgroundColor: '#F3EFE6',
    width: '100%',
    marginTop: heightPercentage(10),
  },
});
