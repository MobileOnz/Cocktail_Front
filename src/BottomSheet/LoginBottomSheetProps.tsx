import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import Modal from 'react-native-modal'; // ✅ react-native-modal 사용
import { widthPercentage, heightPercentage, fontPercentage } from '../assets/styles/FigmaScreen';
import { fonts } from '../lib/theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
interface LoginBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onLogin: () => void;
  navigation: any;
}

const LoginBottomSheet: React.FC<LoginBottomSheetProps> = ({ isVisible, onClose,navigation }) => {

    useEffect(() => {
        console.log('🛠 LoginBottomSheet 모달 렌더링됨 isVisible:', isVisible);
    }, [isVisible]);

    const handleLoginPress = () => {
        onClose(); // ✅ 바텀시트 닫기
        navigation.navigate('Login' as never); // ✅ LoginScreen으로 이동
      };

  return (

    <Modal
      isVisible={isVisible} // ✅ 모달 보이기 여부
      onBackdropPress={onClose} // ✅ 바깥 클릭 시 닫힘
      onSwipeComplete={onClose} // ✅ 스와이프해서 닫기 가능
      swipeDirection="down"
      style={StyleSheet.flatten([styles.modal, { zIndex: 9999 }])}
      animationIn="slideInUp" // ✅ 모달 애니메이션 (아래에서 위로)
      animationOut="slideOutDown" // ✅ 닫힐 때 애니메이션
      backdropOpacity={0.3} // ✅ 배경 흐림 효과 추가
      statusBarTranslucent={true} //상태바까지 흐림 효과 넣어줌
    >

      <View style={styles.container}>
        <View style={{ height: heightPercentage(12) }} />
        <Text style={styles.title}>로그인하기</Text>
        <Image
          source={require('../assets/drawable/login_modal.png')}
          style={styles.imagePlaceholder}
          resizeMode="contain"
        />
        <Text style={styles.subTitle}>로그인을 하시겠어요?</Text>
        <Text style={styles.description}>로그인 후 해당 서비스를 이용할 수 있습니다.</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
            <Text style={styles.loginText}>로그인하기</Text>
          </TouchableOpacity>
        </View>
      </View>


      {/* <SafeAreaView style={{backgroundColor: "#FFFCF3"}}/> */}
    </Modal>

  );
};

export default LoginBottomSheet;

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end', // ✅ 화면 하단에서 띄우기
    margin: 0, // ✅ 전체 화면을 덮도록 설정
    elevation: 9999,
  },
  container: {
    backgroundColor: '#FFFCF3',
    alignItems: 'center',
    padding: widthPercentage(16),
    borderTopLeftRadius: 20, // ✅ 상단 둥근 처리
    borderTopRightRadius: 20,
    zIndex: 9999,
    maxHeight : heightPercentage(550),
  },
  title: {
    fontSize: fontPercentage(18),
    fontFamily: fonts.bold,
    paddingTop : heightPercentage(20),
    marginBottom: heightPercentage(20),
  },
  imagePlaceholder: {
    width: wp(70),
    height: heightPercentage(161),
    borderRadius: 20,
    marginBottom: heightPercentage(16),
  },
  subTitle: {
    fontSize: fontPercentage(18),
    fontFamily: fonts.bold,
    marginBottom: heightPercentage(8),
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(14),
    color: '#7D7A6F',
    marginBottom: heightPercentage(24),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop : heightPercentage(12),
    marginBottom : heightPercentage(50),
  },
  cancelButton: {
    width: wp(45),
    height: hp(7),
    backgroundColor: '#E4DFD8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: fontPercentage(16),
    color: '#7D7A6F',
    fontFamily: fonts.bold,
  },
  loginButton: {
    width: wp(45),
    height: hp(7),
    backgroundColor: '#21103C',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: fontPercentage(16),
    color: '#FFFFFF',
    fontFamily: fonts.bold,
  },
});
