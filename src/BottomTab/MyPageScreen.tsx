import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { widthPercentage, heightPercentage, fontPercentage } from '../assets/styles/FigmaScreen';
import {BannerAd, BannerAdSize, TestIds} from "react-native-google-mobile-ads";
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import { RootStackParamList } from '../Navigation/Navigation';

import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const MyPageScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      setIsLoggedIn(!!token); // token이 존재하면 true
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
          {isLoggedIn ? "로그인 완료!" : "로그인이 필요합니다"}
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
