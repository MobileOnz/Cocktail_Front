import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Linking, Alert } from 'react-native';
import { widthPercentage, heightPercentage, fontPercentage } from '../assets/styles/FigmaScreen';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigation/Navigation';
import WithdrawBottomSheet from '../BottomSheet/WithdrawBottomSheet';
import { useToast } from '../Components/ToastContext';
import instance from '../tokenRequest/axios_interceptor';

//import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';


type NavigationProp = StackNavigationProp<RootStackParamList>;

const MyPageScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { showToast } = useToast();

  const link = () => {
    Linking.openURL("https://sites.google.com/view/onz-info/")
}
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleWithdraw = async () => {
    try {
      await instance.delete('/api/delete/member');
      showToast("탈퇴가 완료되었습니다.");
    } catch (err) {
      console.log("🚨 탈퇴 오류:", err);
    } finally {
      setShowWithdrawModal(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "로그아웃 하시겠어요?",
      "",
      [
        { text: "취소", style: "cancel" },
        {
          text: "로그아웃",
          style: "destructive",
          onPress: async () => {
            try {
              await instance.post("/api/auth/logout");
              showToast("로그아웃 되었습니다.");
              setIsLoggedIn(false);
              setNickname("");
              setProfileImageUri(null);
            } catch (err) {
              console.error("🚨 로그아웃 실패:", err);
              showToast("로그아웃 실패");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const res = await instance.get('/api/profile', { responseType: "blob" });

        const contentType = res.headers['content-type'];

        if (contentType?.includes("application/json")) {
          const { data } = res.data;
          if (data) {
            const fullUri = data.startsWith("http") ? data : `${res.config.baseURL}${data.startsWith("/") ? "" : "/"}${data}`;
            setProfileImageUri(fullUri);
          }
        } else if (contentType?.startsWith("image/")) {
          const imageUrl = URL.createObjectURL(res.data);
          setProfileImageUri(imageUrl);
        }
      } catch (e) {
        console.warn("프로필 이미지 오류:", e);
      }
    };

    const unsubscribe = navigation.addListener('focus', fetchProfileImage);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const checkTokenAndProfile = async () => {
      try {
        const res = await instance.get('/api/get/member');
        if (res.data.code === 1) {
          setIsLoggedIn(true);
          setNickname(res.data.data.nickname);
        } else {
          setIsLoggedIn(false);
          setNickname("");
          setProfileImageUri(null); // <- 프로필 초기화는 유지
        }
      } catch (err) {
        console.log("🚨 로그인 체크 실패:", err);
        setIsLoggedIn(false);
        setNickname("");
        setProfileImageUri(null);
      }
    };
  
    const unsubscribe = navigation.addListener('focus', checkTokenAndProfile);
    return unsubscribe;
  }, [navigation]);
  
  

  const handleLoginPress = () => {
    navigation.navigate(isLoggedIn ? "ProfileScreen" : "Login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.bannerAd}>
        {/* <BannerAd
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
          /> */}
      </View>
      <TouchableOpacity style={styles.loginContainer} onPress={handleLoginPress}>
        <View style={styles.profileInfoContainer}>
          <Image
            source={
              profileImageUri
                ? { uri: profileImageUri }
                : require('../assets/drawable/default_profile.png')
            }
            style={styles.profileImage}
          />
          <Text style={styles.loginText}>
            {isLoggedIn ? nickname : "로그인이 필요합니다."}
          </Text>
        </View>
        <Image source={require('../assets/drawable/right-chevron.png')} style={styles.rightArrow} />
      </TouchableOpacity>

      <Text style={styles.supportTitle}>고객지원</Text>
      <View style={styles.supportSection}>
        {renderSupportItem('question_mark.png', '1:1 문의하기')}
        <View style={styles.divider} />
        {renderSupportItem('smile_face.png', '서비스 리뷰 남기기')}
        <View style={styles.divider} />
        <TouchableOpacity onPress={()=>navigation.navigate("TermsAndConditionsScreen")}>
        {renderSupportItem('book_closed.png', '이용약관')}
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity onPress={link}>
        {renderSupportItem('lock.png', '개인정보처리방침')}
        </TouchableOpacity>
      </View>


      {/* 개인정보처리방침 아래 divider */}
      <View style={styles.bottomDivider} />

      {isLoggedIn && (
        <View>
          <TouchableOpacity onPress={handleLogout}>
            {renderSupportItemWithoutIcon('로그아웃')}
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity onPress={() => setShowWithdrawModal(true)}>
            {renderSupportItemWithoutIcon('회원탈퇴')}
          </TouchableOpacity>
        </View>
      )}



      <WithdrawBottomSheet
        isVisible={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onWithdraw={handleWithdraw}
      />
    </View>
  );
};

const iconMap: { [key: string]: any } = {
  'question_mark.png': require('../assets/drawable/question_mark.png'),
  'smile_face.png': require('../assets/drawable/smile_face.png'),
  'book_closed.png': require('../assets/drawable/book_closed.png'),
  'lock.png': require('../assets/drawable/lock.png'),
  'right-chevron.png': require('../assets/drawable/right-chevron.png'),
};

const renderSupportItem = (icon: string, text: string) => {
  return (
    <View style={styles.supportItem}>
      <View style={styles.leftContent}>
        <Image source={iconMap[icon]} style={styles.supportIcon} />
        <Text style={styles.supportText}>{text}</Text>
      </View>
      <Image source={iconMap['right-chevron.png']} style={styles.rightArrow} />
    </View>
  );
};

const renderSupportItemWithoutIcon = (text: string) => (
  <View style={styles.supportItem}>
    <Text style={[styles.supportText, { marginLeft: 0 }]}>{text}</Text>
    <Image source={iconMap['right-chevron.png']} style={styles.rightArrow} />
  </View>
);


export default MyPageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffcf3',
  },
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: widthPercentage(42),
    height: widthPercentage(42),
    borderRadius: widthPercentage(21),
    marginRight: widthPercentage(12),
    backgroundColor: "#DDD",
  },
  withdrawText: {
    marginTop: heightPercentage(27),
    color: "#7D7A6F",
    textDecorationLine: "underline",
    fontSize: fontPercentage(14),
    alignSelf: "flex-start",
    marginLeft: widthPercentage(24),
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: widthPercentage(24),
    paddingVertical: heightPercentage(12),
    marginTop: heightPercentage(20),
  },
  loginText: {
    fontSize: fontPercentage(18),
    fontWeight: 'bold',
    color: '#2D2D2D',
  },
  supportTitle: {
    fontSize: fontPercentage(14),
    color: '#7D7A6F',
    paddingLeft: widthPercentage(24),
    paddingTop: heightPercentage(15),
  },
  supportSection: {
    backgroundColor: '#fffcf3',
    paddingTop: heightPercentage(27),
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: heightPercentage(12),
    paddingLeft: widthPercentage(24),
  },
  supportIcon: {
    width: widthPercentage(24),
    height: widthPercentage(24),
  },
  supportText: {
    fontSize: fontPercentage(16),
    color: '#2D2D2D',
    marginLeft: widthPercentage(12),
  },
  rightArrow: {
    width: widthPercentage(24),
    height: widthPercentage(24),
    alignSelf: 'flex-end',
    marginRight: widthPercentage(18),
  },
  divider: {
    width: widthPercentage(343),
    height: 1,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerAd: {
    width: widthPercentage(343),
    height: heightPercentage(56),
    alignItems: 'center',
    marginTop: heightPercentage(72),
  },
  bottomDivider: {
    height: heightPercentage(8),
    backgroundColor: '#F3EFE6',
    width: '100%',
    marginTop: heightPercentage(10),
  },
});
