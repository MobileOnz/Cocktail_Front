import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import { widthPercentage, heightPercentage, fontPercentage } from '../assets/styles/FigmaScreen';
import {BannerAd, BannerAdSize, TestIds} from "react-native-google-mobile-ads";
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import { RootStackParamList } from '../Navigation/Navigation';
import WithdrawBottomSheet from '../BottomSheet/WithdrawBottomSheet';
import { API_BASE_URL } from '@env';

import { useToast } from '../Components/ToastContext';

import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const MyPageScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const {showToast} = useToast();

  //닉네임 띄워주기 위한 변수
  const [nickname, setNickname] = useState("");

  //회원탈퇴 모달 상태 체크를 위한 변수
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleWithdraw = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.log("🚫 로그인 필요: accessToken이 없음");
        return;
      }
  
      const res = await fetch(`${API_BASE_URL}/api/delete/member`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });
  
      console.log("📡 응답 status:", res.status);
  
      const text = await res.text();
      console.log("📄 원시 응답 텍스트:", text);
  
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.log("❗ JSON 파싱 실패:", e);
        return;
      }
  
      if (result.code === 1) {
        console.log("✅ 탈퇴 완료:", result.msg);
        showToast("탈퇴가 완료되었습니다.");
      } else {
        console.log("❌ 탈퇴 실패:", result.msg || "탈퇴 요청이 실패했습니다.");
      }
    } catch (err) {
      console.log("🚨 네트워크 오류:", err);
    } finally {
      setShowWithdrawModal(false);
    }
  };
  
  
  
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        setIsLoggedIn(false);
        return;
      }
  
      setIsLoggedIn(true); // 일단 토큰 있으면 true로
      if (token) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/get/member`, {
            headers: {
              Authorization: token,
            },
          });
    
          const result = await res.json();
          if (result.code === 1) {
            setNickname(result.data.nickname || ""); // ✅ 닉네임 설정
            console.log("🪪 닉네임:", result.data.nickname);
          } else {
            console.log("❌ 닉네임 가져오기 실패:", result.msg);
            setIsLoggedIn(false);
          }
        } catch (err) {
          console.log("🚨 닉네임 API 호출 오류:", err);
          setIsLoggedIn(false);
        }
      }
    };

    const unsubscribe = navigation.addListener('focus', checkToken); // 화면 focus 될 때마다 확인
    return unsubscribe;
  }, [navigation]);

  const handleLoginPress = () => {
    if (isLoggedIn) {
      navigation.navigate("ProfileScreen"); // ✅ 로그인된 경우 프로필 화면으로 이동
    } else {
      navigation.navigate("Login"); // ✅ 로그인 안 된 경우 로그인 화면으로 이동
    }
  };

  return (
    <View style={styles.container}>
      {/* 광고 배너 */}
      {/* <View style={styles.adContainer}>
        <BannerAd
          unitId={TestIds.BANNER}
          size={BannerAdSize.BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
      {/* 로그인 필요 알림 or 로그인 완료 메시지 */}
      <TouchableOpacity style={styles.loginContainer} onPress={handleLoginPress}>
        <Text style={styles.loginText}>
          {isLoggedIn ? nickname : "로그인이 필요합니다."}
        </Text>
        <Image source={require('../assets/drawable/right-chevron.png')} style={styles.rightArrow} />
      </TouchableOpacity>

      {/* 고객지원 섹션 */}
      <Text style={styles.supportTitle}>고객지원</Text>
      <View style={styles.supportSection}>
        {renderSupportItem('question_mark.png', '1:1 문의하기')}
        <View style={styles.divider} />
        {renderSupportItem('smile_face.png', '서비스 리뷰 남기기')}
        <View style={styles.divider} />
        {renderSupportItem('book_closed.png', '이용약관')}
        <View style={styles.divider} />
        {renderSupportItem('lock.png', '개인정보처리방침')}
      </View>

      <TouchableOpacity onPress={() => setShowWithdrawModal(true)}>
        <Text style={styles.withdrawText}>회원 탈퇴</Text>
      </TouchableOpacity>

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
      <Image source={iconMap[icon]} style={styles.supportIcon} />
      <Text style={styles.supportText}>{text}</Text>
      <Image source={iconMap['right-chevron.png']} style={styles.rightArrow} />
    </View>
  );
};

export default MyPageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffcf3',
    padding: widthPercentage(20),
  },
  withdrawText: {
    marginTop: heightPercentage(20),
    color: "#7D7A6F",
    textDecorationLine: "underline",
    fontSize: fontPercentage(14),
    alignSelf: "flex-start",
  },
  adBanner: {
    width: widthPercentage(343),
    height: heightPercentage(56),
    marginTop: heightPercentage(100),
    alignSelf: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: widthPercentage(16),
    paddingVertical: heightPercentage(12),
    // marginTop: heightPercentage(12),
    marginTop: heightPercentage(72),
  },
  loginText: {
    fontSize: fontPercentage(18),
    fontWeight: 'bold',
    color: '#2D2D2D',
  },
  supportTitle: {
    fontSize: fontPercentage(14),
    color: '#7D7A6F',
    paddingLeft: widthPercentage(16),
    paddingVertical: heightPercentage(10),
  },
  supportSection: {
    backgroundColor: '#fffcf3',
    paddingHorizontal: widthPercentage(16),
    paddingVertical: heightPercentage(12),
    // borderRadius: 10,
    marginHorizontal: widthPercentage(16),
    // shadowColor: '#000',
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
    // elevation: 2,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: heightPercentage(12),
  },
  supportIcon: {
    width: widthPercentage(24),
    height: widthPercentage(24),
  },
  supportText: {
    fontSize: fontPercentage(16),
    color: '#2D2D2D',
    flex: 1,
    marginLeft: widthPercentage(16),
  },
  rightArrow: {
    width: widthPercentage(24),
    height: widthPercentage(24),
  },
  divider: {
    width: widthPercentage(343),
    height: 1,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
  },
  adContainer: {
    alignItems: "center",
    marginTop: heightPercentage(80),
    marginBottom: heightPercentage(10),
  },
});
