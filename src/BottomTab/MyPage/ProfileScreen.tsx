import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Keyboard,
  Platform,
  InputAccessoryView,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { widthPercentage, heightPercentage, fontPercentage } from '../../assets/styles/FigmaScreen';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/Navigation';
import MyPageViewModel from './MyPageViewModel';
import { SafeAreaView } from 'react-native-safe-area-context';
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'ProfileScreen'>;

interface Props {
  route: ProfileScreenRouteProp;
}


const ProfileScreen: React.FC<Props> = ({ route }: Props) => {
  const { user } = route.params;
  console.log(user);

  const navigation = useNavigation();
  const { loading, nickname, setNickname, profileUri, setProfileUri, handleProfileImageChange, updateUserProfile } = MyPageViewModel();
  // const [newNickname, setNewNickname] = useState('');
  // const [initialProfileUri, setInitialProfileUri] = useState<string | null>(user.profileUrl || null);
  const inputAccessoryViewID = 'nicknameInputAccessory';
  // const isProfileChanged = profileUri !== initialProfileUri;
  // const isChanged = isNicknameChanged || isProfileChanged;
  const [nickNmState, setNickNmState] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (user?.nickname) {
      setNickname(user.nickname);
      setProfileUri(user.profileUrl || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onHandleProfileUpdate = async () => {
    setNickNmState(!nickNmState);
    updateUserProfile();

  };


  // useEffect(() => {
  //   const fetchProfileData = async () => {

  //     try {
  //      const res = await instance.get('/api/get/member', {
  //         authRequired: true,
  //       }as any);

  //       const json = res.data;
  //       console.log('👤 get/member 응답:', json);

  //       if (json && json.code === 1) {
  //         const member = json.data;
  //         setNickname(member.nickname);
  //         setNewNickname('');
  //         console.log('✅ 닉네임 불러오기 완료:', member.nickname);
  //       } else {
  //         console.warn('❌ 닉네임 API 실패:', json?.msg || json);
  //       }
  //     } catch (error) {
  //       console.error('❌ 닉네임 불러오기 실패', error);
  //     }

  //     try {
  //       const profileRes = await instance.get('/api/profile', {
  //         responseType: 'blob',
  //       });

  //       const contentType = profileRes.headers['content-type'];

  //       if (contentType?.includes('application/json')) {
  //         // blob -> text -> json 파싱
  //         const text = await profileRes.data.text();
  //         const profileJson = JSON.parse(text);
  //         console.log('📷 프로필 응답 (JSON):', profileJson);

  //         if (profileJson && profileJson.code === 1 && profileJson.data) {
  //           const profileUrl = profileJson.data;
  //           const fullUri = profileUrl.startsWith('http')
  //             ? profileUrl
  //             : `${API_BASE_URL}${profileUrl.startsWith('/') ? '' : '/'}${profileUrl}`;

  //           setProfileUri(fullUri);
  //           setInitialProfileUri(fullUri);

  //           const short = fullUri.length > 100 ? fullUri.slice(0, 100) + '...' : fullUri;
  //           console.log('✅ 프로필 이미지 불러오기 완료:', short);
  //         } else {
  //           console.warn('❌ 프로필 이미지 API 실패:', profileJson?.msg || profileJson);
  //         }

  //       } else if (contentType?.startsWith('image/')) {
  //         const blob = profileRes.data;

  //         const reader = new FileReader();
  //         reader.onloadend = () => {
  //           const base64data = reader.result as string;
  //           setProfileUri(base64data);
  //           setInitialProfileUri(base64data);
  //           console.log('📷 Base64 이미지 설정 완료');
  //         };
  //         reader.readAsDataURL(blob);
  //       }
  //        else {
  //         console.warn('❓ 알 수 없는 Content-Type 응답:', contentType);
  //       }

  //     } catch (error) {
  //       console.error('❌ 프로필 이미지 불러오기 실패', error);
  //     }
  //   };

  //   fetchProfileData();
  // }, []);


  // 프로필 설정 서버 저장
  // const handleSave = async () => {
  //   if (!isChanged) {return;}

  //   try {
  //     const res = await instance.post('/api/update/member', {
  //       gender: 'none',
  //       nickName: newNickname || nickname,
  //       name: 'test',
  //       addr: 'seoul',
  //       age: 20,
  //     },
  //     {
  //       authRequired : true,
  //     }as any
  //   );

  //     const result = res.data;
  //     if (result.code === 1) {
  //       if (isNicknameChanged) {
  //         setNickname(newNickname);
  //         setNewNickname('');
  //       }
  //       if (isProfileChanged) {
  //         setInitialProfileUri(profileUri);
  //       }
  //     }
  //     navigation.goBack();
  //   } catch (error) {
  //     console.error('🔥 프로필 저장 중 에러 발생', error);
  //   }
  // };

  // const handleProfileImageChange = async () => {
  //   launchImageLibrary(
  //     { mediaType: 'photo', selectionLimit: 1 },
  //     async (response) => {
  //       if (!response.didCancel && response.assets && response.assets.length > 0) {
  //         try {
  //           const asset = response.assets[0];
  //           console.log('📸 선택된 원본 이미지:', asset);

  //           const resizedImage = await ImageResizer.createResizedImage(
  //             asset.uri!,
  //             400, // 너비 (원본 비율 유지됨)
  //             400, // 높이
  //             'PNG', // 포맷 강제 지정
  //             80 // 품질 (0~100)
  //           );

  //           const uri = resizedImage.uri;


  //           if (!initialProfileUri) {setInitialProfileUri(uri);}
  //           setProfileUri(uri);



  //           const uploadJson = uploadRes.data;
  //           if (uploadJson?.code === 1) {
  //             console.log('✅ 즉시 프로필 이미지 업로드 성공');
  //           } else {
  //             console.warn('❌ 즉시 업로드 실패:', uploadJson?.msg);
  //           }
  //         } catch (error) {
  //           console.error('❌ 이미지 리사이즈 실패 또는 업로드 오류:', error);
  //         }
  //       }
  //     }
  //   );
  // };


  return (
    <SafeAreaView edges={['top']} style={styles.container} >
      {loading ? (
        <ActivityIndicator size="large" color="#000000ff" style={{ flex: 1 }} />
      ) : (
        <View>
          {/* 상단 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image source={require('../../assets/drawable/left-chevron.png')} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>프로필 설정</Text>
            <View style={styles.backIcon} />
          </View>

          {/* 프로필 이미지 */}
          <View style={styles.profileSection}>
            <TouchableOpacity style={styles.profileWrapper} onPress={handleProfileImageChange}>
              <Image
                source={
                  profileUri
                    ? { uri: profileUri }
                    : require('../../assets/drawable/profile.png')
                }
                style={styles.profileImage}
              />
              {/* <Image source={require('../../assets/drawable/edit_icon.png')} style={styles.editIcon} /> */}
            </TouchableOpacity>
          </View>

          {/* 닉네임 입력 */}
          <View style={styles.nicknameSection}>
            <Text style={styles.nicknameLabel}>닉네임</Text>

            <View style={styles.nickNameContainer}>

              {nickNmState === true ? (
                <TextInput style={styles.nicknameInput}
                  value={nickname}
                  onChangeText={setNickname}
                />
              ) : (
                <Text style={styles.nickNameText}>{nickname || ''}</Text>
              )
              }

              <TouchableOpacity
                style={styles.editNickBtn}
                onPress={onHandleProfileUpdate}
              >
                <Text style={styles.editNickName}>수정하기</Text>
              </TouchableOpacity>

            </View>
            {/* <TextInput
              style={styles.nicknameInput}
              value={newNickname}
              onChangeText={setNewNickname}
              placeholder={nickname}
              returnKeyType="default"
              inputAccessoryViewID={inputAccessoryViewID}
              keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
            /> */}

            <Text style={styles.accountLabel}>연결된 계정</Text>

            <View style={styles.accountNameContainer}>
              <Text style={styles.nickNameText}>{user?.email || ''}</Text>
              {renderAccountItem(getSocialLabel(user?.socialLogin) || '', getSocialIcon(user?.socialLogin))}
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('QuitScreen')}
            >
              <Text style={styles.quitText}>서비스 탈퇴하기</Text>
            </TouchableOpacity>
          </View>



          {/* 키보드 상단 '완료' 버튼 (iOS 한정) */}
          {Platform.OS === 'ios' && (
            <InputAccessoryView nativeID={inputAccessoryViewID}>
              <View style={
                [
                  styles.accessory,
                  colorScheme === 'dark' ? styles.accessoryDark : styles.accessoryLight,
                ]}>
                {/* 좌측 화살표들 생략 가능 */}
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={Keyboard.dismiss}>
                  <Text
                    style={[
                      styles.accessoryDoneText,
                      colorScheme === 'dark' && { color: '#fff' },
                    ]}
                  >
                    완료
                  </Text>
                </TouchableOpacity>
              </View>
            </InputAccessoryView>
          )}
        </View>
      )}



      {/* 저장하기 버튼 */}
      {/* <TouchableOpacity
        style={[styles.saveButton, isChanged ? styles.activeButton : styles.disabledButton]}
        disabled={!isChanged}
        onPress={handleSave}
      >
        <Text
          style={[
            styles.saveButtonText,
            isChanged ? styles.activeButtonText : styles.disabledButtonText,
          ]}
        >
          저장하기
        </Text>
      </TouchableOpacity> */}


    </SafeAreaView>
  );
};

export default ProfileScreen;


const renderAccountItem = (text: string, iconUrl: string) => {
  return (
    <View style={styles.accountItem}>
      <Image
        source={iconUrl}
        style={styles.icon}
      />
      <Text style={styles.accountText}>{text}</Text>
    </View>
  );
};

const getSocialIcon = (socialLogin?: string) => {
  switch (socialLogin) {
    case 'KAKAO':
      return require('../../assets/drawable/kakao.png');
    case 'NAVER':
      return require('../../assets/drawable/Naver.png');
    case 'GOOGLE':
      return require('../../assets/drawable/Google.png');
    default:
      return require('../../assets/drawable/kakao_button.png');
  }
};

const getSocialLabel = (socialLogin?: string) => {
  switch (socialLogin) {
    case 'KAKAO':
      return '카카오';
    case 'NAVER':
      return '네이버';
    case 'GOOGLE':
      return '구글';
    default:
      return '';
  }
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  icon: {
    width: widthPercentage(24),
    height: heightPercentage(24),
  },
  headerTitle: {
    fontSize: fontPercentage(20),
    fontWeight: '600',
    color: '#1B1B1B',
  },
  backIcon: {
    width: widthPercentage(28),
    height: widthPercentage(28),
    resizeMode: 'contain',
  },
  profileSection: {
    alignItems: 'center',
  },
  profileWrapper: {
    marginTop: heightPercentage(32),
    width: widthPercentage(80),
    height: widthPercentage(80),
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: widthPercentage(80),
    height: widthPercentage(80),
    borderRadius: widthPercentage(45),
    backgroundColor: '#DDD',
  },
  editIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: widthPercentage(24),
    height: widthPercentage(24),
    resizeMode: 'contain',
    backgroundColor: '#F3EFE6',
    borderRadius: widthPercentage(12),
  },
  nicknameSection: {
    marginTop: heightPercentage(32),
  },
  nicknameLabel: {
    fontSize: fontPercentage(14),
    color: '#BDBDBD',
    fontWeight: '500',
    paddingVertical: heightPercentage(8),
    paddingHorizontal: widthPercentage(20),
  },
  accountLabel: {
    fontSize: fontPercentage(14),
    color: '#BDBDBD',
    fontWeight: '500',
    paddingVertical: heightPercentage(8),
    paddingHorizontal: widthPercentage(20),
    marginTop: heightPercentage(16),
  },
  accountNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: heightPercentage(52),
    backgroundColor: '#F5F5F5',
    paddingVertical: heightPercentage(14),
    marginHorizontal: widthPercentage(20),
    paddingHorizontal: widthPercentage(12),
    borderRadius: 8,
  },
  nickNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: heightPercentage(52),
    backgroundColor: '#F5F5F5',
    paddingVertical: heightPercentage(14),
    marginHorizontal: widthPercentage(20),
    paddingLeft: widthPercentage(12),
    paddingRight: widthPercentage(8),
    borderRadius: 8,
  },
  nickNameText: {
    fontSize: fontPercentage(16),
    color: '#1B1B1B',
    fontWeight: '500',
    flex: 1,
  },
  editNickBtn: {
    height: heightPercentage(32),
    borderRadius: 8,
    borderColor: '#E0E0E0',
    backgroundColor: '#ffffffff',
    borderWidth: 1,
    justifyContent: 'center',
    paddingVertical: heightPercentage(8),
    paddingHorizontal: widthPercentage(8),
  },
  editNickName: {
    fontSize: fontPercentage(12),
    color: '#1B1B1B',
    fontWeight: '500',
  },
  nicknameInput: {
    flex: 1,
    fontSize: fontPercentage(16),
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: heightPercentage(0),
    paddingHorizontal: widthPercentage(0),
    marginEnd: widthPercentage(10),
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountText: {
    fontSize: fontPercentage(13),
    color: '#616161',
    fontWeight: '400',
    marginLeft: widthPercentage(8),
  },
  quitText: {
    marginTop: heightPercentage(18),
    fontSize: fontPercentage(14),
    color: '#616161',
    textAlign: 'right',
    fontWeight: '500',
    marginHorizontal: widthPercentage(20),
  },
  saveButton: {
    position: 'absolute',
    bottom: heightPercentage(50),
    width: widthPercentage(343),
    height: heightPercentage(48),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  activeButton: {
    backgroundColor: '#21103C',
  },
  disabledButton: {
    backgroundColor: '#F3EFE6',
  },
  saveButtonText: {
    fontSize: fontPercentage(16),
    fontWeight: 'bold',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#C1C1C1',
  },
  accessory: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: widthPercentage(16),
    paddingVertical: heightPercentage(10),
    backgroundColor: '#F3EFE6',
    borderTopWidth: 1,
    borderColor: '#DCDCDC',
  },
  doneButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#21103C',
    borderRadius: 8,
  },
  accessoryDoneText: {
    fontSize: fontPercentage(16),
    fontWeight: '500',
    color: '#007AFF', // iOS 기본 파란 텍스트
  },
  accessoryLight: {
    backgroundColor: '#F3EFE6', // 밝은 테마용 배경
  },
  accessoryDark: {
    backgroundColor: '#2C2C2E', // 다크모드 키보드 배경에 맞춘 어두운 배경 (iOS 기본 다크와 유사)
  },
});
