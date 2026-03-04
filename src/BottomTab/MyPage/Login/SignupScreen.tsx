import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
} from 'react-native';
import {
  heightPercentage,
  widthPercentage,
  fontPercentage,
} from '../../../assets/styles/FigmaScreen';
// import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../Navigation/Navigation';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
// import instance from '../../tokenRequest/axios_interceptor';
import { Divider } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import SignUpViewModel from './SignUpViewModel';
import { SignUpRequest } from '../../../model/domain/SignupRequest';
import DeviceInfo from 'react-native-device-info';
import { useToast } from '../../../Components/ToastContext';
import { SafeAreaView } from 'react-native-safe-area-context';

// const server = API_BASE_URL;
type SignupScreenRouteProp = RouteProp<RootStackParamList, 'SignupScreen'>;
type SignupScreenProps = StackScreenProps<RootStackParamList, 'SignupScreen'>;

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {

  const route = useRoute<SignupScreenRouteProp>();
  const signUpCode = route.params?.code ?? '';
  const { showToast } = useToast();
  const { signUp } = SignUpViewModel();
  const [modalVisible, setModalVisible] = useState(false);


  //회원가입 처리
  const signUpRequest = async () => {
    if (!nickname) {
      console.log('닉네임이 없습니다.');
      return;
    }
    if (!signUpCode) {
      showToast('인증 코드가 없습니다. 다시 로그인해주세요.');
      navigation.navigate('Login' as never);
      return;
    }
    const deviceId = await DeviceInfo.getUniqueId();
    const payload: SignUpRequest = {
      code: signUpCode,
      nickName: nickname,
      deviceNumber: deviceId,
      ageTerm: agreements.age,
      serviceTerm: agreements.terms,
      marketingTerm: agreements.marketing,
      adTerm: agreements.ads,
    };

    try {
      const result = await signUp(payload);
      console.log('백엔드 응답', result);
      setModalVisible(false);
      navigation.navigate('BottomTabNavigator' as never);
    } catch (error: any) {
      showToast('알 수 없는 오류가 발생했습니다.');
      // 에러 시 모달 유지 → 사용자가 다시 시도 가능
    }
  };

  
  //필수만 bold 처리
  const textBoldChange = (text: string) => {
    const boldText = text.slice(0, 4);
    const afterText = text.slice(4);
    if (boldText === '(필수)') {
      return (
        <Text style={styles.individualAgreementText}>
          <Text style={{ fontWeight: '600', fontSize: fontPercentage(16) }}>{boldText}</Text>
          <Text style={{ fontWeight: '500', fontSize: fontPercentage(16) }}>{afterText}</Text>
        </Text>
      );
    }
    return (
      <Text style={styles.individualAgreementText}>
        {text}
      </Text>
    );

  };
  const [nickname, setNickname] = useState('');
  const [agreements, setAgreements] = useState({
    all: false,
    age: false,
    terms: false,
    marketing: false,
    ads: false,
  });
  const [detailsVisible, setDetailsVisible] = useState({
    age: false,
    terms: false,
    marketing: false,
    ads: false,
  });

  const handleCheckboxChange = (key: keyof typeof agreements) => {
    if (key === 'all') {
      const newState = !agreements.all;
      setAgreements({
        all: newState,
        age: newState,
        terms: newState,
        marketing: newState,
        ads: newState,
      });
    } else {
      const newAgreements = { ...agreements, [key]: !agreements[key] };
      newAgreements.all =
        newAgreements.age &&
        newAgreements.terms &&
        newAgreements.marketing &&
        newAgreements.ads;
      setAgreements(newAgreements);
    }
  };

  const toggleDetails = (key: keyof typeof detailsVisible) => {
    setDetailsVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 모달 버튼 활성화/비활성화 여부
  const isButtonDisabled = (agreements.age && agreements.terms);
  const isNickDisabled = (nickname != '');

  return (
    <SafeAreaView edges={['top']} style={styles.container} >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../../../assets/drawable/left-chevron.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.backIcon} />
      </View>


      <View style={styles.contentContainer}>

        <Text style={styles.welcomeTitle}>어서오세요 👋</Text>
        <Text style={styles.description}>
          온즈에서 사용할 닉네임을 설정해 주세요.
        </Text>

        {/* 닉네임 입력 */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="닉네임을 입력해 주세요"
            placeholderTextColor="#BDBDBD"
            value={nickname}
            onChangeText={setNickname}
          />
          {nickname.length > 0 && (
            <TouchableOpacity onPress={() => setNickname('')}>
              <Image
                source={require('../../../assets/drawable/close.png')}
                style={styles.clearIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 시작하기 버튼 */}
      <TouchableOpacity
        style={[styles.startButton, !isNickDisabled && styles.startButtonDisabled]}
        disabled={!isNickDisabled}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.startButtonText,
            isNickDisabled && styles.startButtonTextDisabled,
          ]}
        >
          다음으로
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>

            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Image source={require('../../../assets/drawable/close.png')} style={styles.closeIcon} tintColor={'#000000ff'} />
              </TouchableOpacity>
              <View style={styles.backIcon} />
            </View>

            <View style={styles.modalContent}>
              {/* 모든 약관 동의 */}
              <TouchableOpacity
                style={styles.agreementItem}
                onPress={() => handleCheckboxChange('all')}
              >
                <Image
                  source={
                    agreements.all
                      ? require('../../../assets/drawable/checkbox_checked.png')
                      : require('../../../assets/drawable/checkbox_unchecked.png')
                  }
                  style={styles.checkbox}
                />
                <Text style={styles.agreementText}>모든 약관에 동의합니다</Text>
              </TouchableOpacity>

              <Divider style={styles.divider} />
              {/* 개별 약관 동의 */}
              {[
                { key: 'age', text: '(필수) 만 17세 이상입니다.' },
                { key: 'terms', text: '(필수) 서비스 이용약관에 동의합니다.' },
              ].map(({ key, text }) => (
                <View key={key}>
                  <TouchableOpacity
                    style={styles.agreementItem}
                    onPress={() => handleCheckboxChange(key as keyof typeof agreements)}
                  >
                    <Image
                      source={
                        agreements[key as keyof typeof agreements]
                          ? require('../../../assets/drawable/checkbox_checked.png')
                          : require('../../../assets/drawable/checkbox_unchecked.png')
                      }
                      style={styles.checkbox}
                    />
                    {textBoldChange(text)}
                    <TouchableOpacity onPress={() => toggleDetails(key as keyof typeof detailsVisible)}>
                      <Image
                        source={require('../../../assets/drawable/right-chevron.png')}
                        style={[
                          styles.arrowIcon,
                          detailsVisible[key as keyof typeof detailsVisible] && styles.arrowRotated,
                        ]}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                  {/* 약관 상세 내용 */}
                  {/* {detailsVisible[key as keyof typeof detailsVisible] && (
                    <View style={styles.detailBox}>
                      <TouchableOpacity onPress={()=>navigation.navigate('TermsAndConditionsScreen')}>
                        <Text style={styles.detailText}>
                        {text}에 대한 자세한 내용입니다. 여기에 약관 내용을 넣으세요.
                      </Text>
                      </TouchableOpacity>
                    </View>
                  )} */}
                </View>
              ))}

              <TouchableOpacity
                style={[styles.startBtn, !isButtonDisabled && styles.startBtnDisabled]}
                disabled={!isButtonDisabled}
                onPress={signUpRequest}
              >
                <Text style={styles.startText}>시작하기</Text>
              </TouchableOpacity>

            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: widthPercentage(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: heightPercentage(52),
    paddingHorizontal: widthPercentage(16),
    paddingTop: heightPercentage(14),
    paddingBottom: heightPercentage(10),
  },
  backButton: {
    position: 'absolute',
    top: heightPercentage(15), // 🔥 더 위로 조정
    left: widthPercentage(16),
    zIndex: 10,
  },
  backIcon: {
    width: widthPercentage(28),
    height: widthPercentage(28),
    resizeMode: 'contain',
  },
  closeIcon: {
    width: widthPercentage(24),
    height: heightPercentage(24),
  },
  welcomeTitle: {
    fontSize: fontPercentage(22),
    fontWeight: '600',
    color: '#1B1B1B',
    marginTop: heightPercentage(24),
  },
  description: {
    fontSize: fontPercentage(16),
    fontWeight: '500',
    color: '#616161',
    marginTop: heightPercentage(4),    
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: heightPercentage(52),
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: widthPercentage(12),
    marginTop: heightPercentage(28),
  },
  input: {
    flex: 1,
    fontSize: fontPercentage(16),
    fontWeight: '500',
    color: '#2D2D2D',
  },
  clearIcon: {
    width: widthPercentage(16),
    height: heightPercentage(16),
  },
  agreementContainer: {
    backgroundColor: '#F9F8F6',
    padding: widthPercentage(16), // 🔥 좌우 패딩 조정
    borderRadius: 10,
    marginTop: heightPercentage(30), // 🔥 닉네임 필드와 간격 조정
  },
  agreementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: heightPercentage(10),
    paddingHorizontal: widthPercentage(10),
    marginBottom: heightPercentage(8),
  },
  checkbox: {
    width: widthPercentage(24),
    height: widthPercentage(24),
    marginRight: widthPercentage(10),
  },
  agreementText: {
    fontSize: fontPercentage(16),
    color: '#2D2D2D',
    fontWeight: 'bold',
  },
  individualAgreementText: {
    fontSize: fontPercentage(14),
    color: '#2D2D2D',
    flex: 1,
  },
  arrowIcon: {
    width: widthPercentage(24),
    height: widthPercentage(24),
  },
  arrowRotated: {
    transform: [{ rotate: '90deg' }],
  },
  startButton: {
    position: 'absolute',
    bottom: 52,
    left: 0,
    right: 0,
    marginHorizontal: widthPercentage(16),
    backgroundColor: '#313131',
    borderRadius: 8,
    paddingVertical: heightPercentage(14),
    alignItems: 'center',

  },
  startButtonDisabled: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: fontPercentage(16),
    color: '#FAFAFA',
    fontWeight: '600',
  },
  startButtonTextDisabled: {
    fontSize: fontPercentage(16),
    color: '#FAFAFA',
    fontWeight: '600',
  },
  detailBox: {
    padding: widthPercentage(10),
    backgroundColor: '#E4DFD8',
    borderRadius: 5,
  },
  detailText: {
    fontSize: fontPercentage(14),
    color: '#2D2D2D',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContainer: {
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    backgroundColor: 'white',
  },
  modalHeader: {
    alignItems: 'flex-end',
    paddingTop: heightPercentage(16),
    paddingRight: widthPercentage(16),
  },
  modalContent: {
    paddingHorizontal: widthPercentage(16),
    justifyContent: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: '#D9D9D9',
    marginBottom: heightPercentage(8),
  },
  startBtn: {
    width: '100%',
    backgroundColor: '#313131',
    marginBottom: heightPercentage(52),
    marginTop: heightPercentage(24),
    alignItems: 'center',
    justifyContent: 'center',
    height: heightPercentage(52),
    borderRadius: 8,
  },
  startBtnDisabled: {
    backgroundColor: '#E0E0E0',
  },
  startText: {
    fontSize: fontPercentage(16),
    color: '#FFFFFF',
    fontWeight: '600',
  },
});


export default SignupScreen;


{/* <View style={styles.agreementContainer}> */ }
{/* 모든 약관 동의 */ }
//   <TouchableOpacity
//     style={styles.agreementItem}
//     onPress={() => handleCheckboxChange('all')}
//   >
//     <Image
//       source={
//         agreements.all
//           ? require('../../../assets/drawable/checkbox_checked.png')
//           : require('../../../assets/drawable/checkbox_unchecked.png')
//       }
//       style={styles.checkbox}
//     />
//     <Text style={styles.agreementText}>모든 약관에 동의합니다</Text>
//   </TouchableOpacity>

//   {/* 개별 약관 동의 */}
//   {[
//     { key: 'age', text: '(필수) 만 14세 이상입니다' },
//     { key: 'terms', text: '(필수) 서비스 이용약관' },
//     { key: 'marketing', text: '(선택) 마케팅 활용 동의' },
//     { key: 'ads', text: '(선택) 광고성 정보 수신 동의' },
//   ].map(({ key, text }) => (
//     <View key={key}>
//       <TouchableOpacity
//         style={styles.agreementItem}
//         onPress={() => handleCheckboxChange(key as keyof typeof agreements)}
//       >
//         <Image
//           source={
//             agreements[key as keyof typeof agreements]
//               ? require('../../../assets/drawable/checkbox_checked.png')
//               : require('../../../assets/drawable/checkbox_unchecked.png')
//           }
//           style={styles.checkbox}
//         />
//         {textBoldChange(text)}
//         <TouchableOpacity onPress={() => toggleDetails(key as keyof typeof detailsVisible)}>
//           <Image
//             source={require('../../../assets/drawable/chevron.png')}
//             style={[
//               styles.arrowIcon,
//               detailsVisible[key as keyof typeof detailsVisible] && styles.arrowRotated,
//             ]}
//           />
//         </TouchableOpacity>
//       </TouchableOpacity>

//       {/* 약관 상세 내용 */}
//       {detailsVisible[key as keyof typeof detailsVisible] && (
//         <View style={styles.detailBox}>
//           <TouchableOpacity onPress={()=>navigation.navigate('TermsAndConditionsScreen')}>
//             <Text style={styles.detailText}>
//             {text}에 대한 자세한 내용입니다. 여기에 약관 내용을 넣으세요.
//           </Text>
//           </TouchableOpacity>

//         </View>
//       )}
//     </View>
//   ))}
// </View>
