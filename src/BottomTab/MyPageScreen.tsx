import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { widthPercentage, heightPercentage, fontPercentage } from '../assets/styles/FigmaScreen';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigation/Navigation';
// import WithdrawBottomSheet from '../BottomSheet/WithdrawBottomSheet';
// import { useToast } from '../Components/ToastContext';
// import instance from '../tokenRequest/axios_interceptor';
// import SignOutModal from '../Components/SignOutModal';

//import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';


type NavigationProp = StackNavigationProp<RootStackParamList>;

const MyPageScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isLoggedIn] = useState(false);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const { showToast } = useToast();

  // const [showSignOutModal, setShowSignOutModal] = useState(false);

//   const link = () => {
//     Linking.openURL('https://sites.google.com/view/onz-info/');
// };
  // const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [nickname] = useState('aa');
  // const [nickname, setNickname] = useState('aa');
  // const [showWithdrawModal, setShowWithdrawModal] = useState(false);

// const handleWithdraw = async () => {
//   try {
//     await instance.delete('/api/delete/member', {
//       authRequired: true,
//     }as any);
//     showToast('탈퇴가 완료되었습니다.');

//     setIsLoggedIn(false);
//     setNickname('');
//     setProfileImageUri(null);
//   } catch (err: any) {
//     console.log('🚨 탈퇴 오류:', err.response?.data || err.message);
//   } finally {
//     setShowWithdrawModal(false);
//   }
// };


  // const handleLogout = async () => {
  //   try {
  //     await instance.post('/api/auth/logout', null, {
  //       authRequired: true,
  //     }as any);
  //     showToast('로그아웃 되었습니다.');
  //     setIsLoggedIn(false);
  //     setNickname('');
  //     setProfileImageUri(null);
  //   } catch (err) {
  //     console.error('🚨 로그아웃 실패:', err);
  //     showToast('로그아웃 실패');
  //   } finally {
  //     setShowSignOutModal(false);
  //   }
  // };


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



  const handleLoginPress = () => {
    navigation.navigate(isLoggedIn ? 'ProfileScreen' : 'Login');
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
      
      <View style={styles.topBar}>
        <Text style={styles.topTitleText}>마이페이지</Text>
      </View>

      {/* 광고 이미지 넣기*/}
      {isLoggedIn && <View style={styles.bannerAd}></View>}

      {/* 로그인 O */}
      {isLoggedIn ? (
        <>
          <TouchableOpacity style={styles.profileInfoContainer} onPress={handleLoginPress}>
            <Image
              source={require('../assets/drawable/profile.png')}
              style={styles.profileImage}
            />
            <Text style={styles.userNickNmText}>사용자 닉네임</Text>
            <Image source={require('../assets/drawable/right-chevron.png')} style={styles.profilerightArrow} />
          </TouchableOpacity>
        
          <TouchableOpacity style={styles.cocktailBox}>
            <Text style={styles.cocktailBoxText}>나의 칵테일 보관함</Text>
            <Image source={require('../assets/drawable/bookmark.png')} style={styles.cockTailBookmark} />
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={styles.loginContainer} onPress={handleLoginPress}>
          <Text style={styles.loginText}>
            {isLoggedIn ? nickname : '로그인・회원가입'}
          </Text> 
        </TouchableOpacity>
      )}

      {/* 광고 이미지 넣기*/}
      {!isLoggedIn && <View style={styles.bannerAd}></View>}



      <Text style={styles.supportTitle}>고객지원</Text>
      <View style={styles.supportSection}>
        {renderSupportItem('버전 정보')}
        <TouchableOpacity>
          {renderSupportItem('1:1 문의하기')}
        </TouchableOpacity>
        <TouchableOpacity>
          {renderSupportItem('서비스 리뷰 남기기')}
        </TouchableOpacity>
      </View>

      <Text style={styles.supportSecondTitle}>서비스 약관</Text>
      <TouchableOpacity onPress={()=>navigation.navigate('TermsAndConditionsScreen')}>
        {renderSupportItem('이용약관')}
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>navigation.navigate('PrivacyPolicyScreen')}>
        {renderSupportItem('개인정보 처리방침')}
      </TouchableOpacity>

      {isLoggedIn && (
        <View>
          <TouchableOpacity onPress={() => setShowSignOutModal(true)}>
            {renderSupportItemWithoutIcon('로그아웃')}
          </TouchableOpacity>

          {/* <TouchableOpacity onPress={() => setShowWithdrawModal(true)}>
            {renderSupportItemWithoutIcon('회원탈퇴')}
          </TouchableOpacity> */}
        </View>
      )}

      {/* <WithdrawBottomSheet
        isVisible={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onWithdraw={handleWithdraw}
      />

    <SignOutModal
      visible={showSignOutModal}
      onClose={() => setShowSignOutModal(false)}
      onSignOut={handleLogout}
    /> */}

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

const renderSupportItemWithoutIcon = (text: string) => (
  <View style={[styles.supportItem, {marginTop: heightPercentage(8)}]}>
    <Text style={[styles.supportText, { color: '#BDBDBD' }]}>{text}</Text>
  </View>
);


export default MyPageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffcf3',
  },
  topBar : {
    width: '100%',
    height: 52,
    paddingHorizontal: widthPercentage(16),
    paddingTop: heightPercentage(14),
    paddingBottom: heightPercentage(10)
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
    flex: 1
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
    borderRadius: 8
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
    marginTop: heightPercentage(16)
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
    height: heightPercentage(36)
  },
  supportSecondTitle: {
    fontSize: fontPercentage(14),
    color: '#BDBDBD',
    fontWeight: '500',
    paddingHorizontal: widthPercentage(16),
    paddingVertical: heightPercentage(8),
    marginTop: heightPercentage(16),
    height: heightPercentage(36)
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
    fontWeight: '500'
  },
  profilerightArrow: {
    width: widthPercentage(24),
    height: widthPercentage(24),
  },
  cockTailBookmark: {
    width: widthPercentage(24),
    height: widthPercentage(24),
    tintColor: '#FFFFFF'
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
