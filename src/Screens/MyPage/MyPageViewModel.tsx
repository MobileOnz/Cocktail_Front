import { useEffect, useMemo, useState } from "react";
import { MemberRemoteDataSource } from "../../model/DataSource/MemberDataSource";
import { MemberRepository } from "../../model/repository/MemberRepository";
import { AuthRemoteDataSource } from "../../model/DataSource/AuthRemoteDataSource";
import { launchImageLibrary } from "react-native-image-picker";
import ImageResizer from "react-native-image-resizer";
import { User } from "../../model/domain/User";
import { UserUpdate } from "../../model/dto/UserUpdateDto"

const MyPageViewModel = () => {
  const repository = useMemo(
    () =>
      new MemberRepository(
        new MemberRemoteDataSource(),
        new AuthRemoteDataSource()
      ),
    []
  );

  const [profileUri, setProfileUri] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    getMemberInfo();
  }, [profileUri]);
  
  const getMemberInfo = async () => {
    try {
      setLoading(true)
      const result = await repository.getMyInfo();
      setUser(result)
      setNickname(result.nickname)
      
      if (user?.profileUrl !== null) {
        getUserProfileImage()
      }

      console.log("내 정보 수신: ", result)
      return result
    } catch (e: any) {
      if (e.response?.status === 401) {
        setUser(null)
        return null; // 비로그인 상태
      }
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    try {
      const status = await repository.logout();
      console.log('로그아웃 처리 완료');
      return status;
    } catch (error) {
      console.error('로그아웃 실패', error);
    }
  };

  // const uploadProfileImage = async() {
  //   try {
  //     const status = await repository.uploadProfileImage(uri);
  //     console.log("로그아웃 처리 완료");
  //     return status
  //   } catch (error) {
  //     console.error("로그아웃 실패", error);
  //   }
  // }

  const updateUserProfile = async() => {
    console.log("updateUserProfile", nickname + " : " + user?.nickname)
    if (nickname === user?.nickname) {
      return
    }
    const data: UserUpdate = {
      gender : "",
      name : "",
      addr : "",
      age : 0,
      adTerm : user?.terms.ad,
      marketingTerm : user?.terms.marketing,
      nickName : nickname
    }
    try {
      const res = await repository.updateUserProfile(data)
      console.log("updateUserProfile 백엔드 응답: ", res)
    } catch (error) {
      console.log("updateUserProfile 백엔드 응답: ", "오류")
    }
  }

  const getUserProfileImage = async() => {
    try {
      setLoading(true)
      const blob = await repository.getUserProfileImage()
      console.log("MyPageViewModel: ", blob)
      if (blob !== null) {
  
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setProfileUri(base64data);
          console.log('📷 Base64 이미지 설정 완료');
        };
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      setLoading(false)
      console.log("getUserProfileImage 백엔드 응답: ", "오류")
    } finally {
      setLoading(false);
    }
  }

  const withDrawUser = async() => {
    try {
      setLoading(true)
      const res = await repository.withDrawUser()
      return res.code
    } catch(error){
      setLoading(false)
      return -1
    } finally {
      setLoading(false);
    }
  }



  const handleProfileImageChange = async () => {
      launchImageLibrary(
        { mediaType: 'photo', selectionLimit: 1 },
        async (response) => {
          if (!response.didCancel && response.assets && response.assets.length > 0) {
            try {
              setLoading(true)
              const asset = response.assets[0];
              console.log('📸 선택된 원본 이미지:', asset);
  
              const resizedImage = await ImageResizer.createResizedImage(
                asset.uri!,
                400, // 너비 (원본 비율 유지됨)
                400, // 높이
                'PNG', // 포맷 강제 지정
                80 // 품질 (0~100)
              );
  
              const uri = resizedImage.uri;
              console.log("image: ", uri)
  
              if (!profileUri) {setProfileUri(uri);}
              setProfileUri(uri);
  
              const res = await repository.uploadProfileImage(uri)
              console.log("백엔드 응답: ", res)
              if (res?.code === 1) {
                console.log('✅ 즉시 프로필 이미지 업로드 성공');
              } else {
                console.warn('❌ 즉시 업로드 실패:', res?.msg);
              }
            } catch (error) {
              console.error('❌ 이미지 리사이즈 실패 또는 업로드 오류:', error);
            } finally {
              setLoading(false)
            }

          }
        }
      )
    }

  return { nickname, setNickname, profileUri, setProfileUri, user, setUser, loading, withDrawUser, getMemberInfo, logOut, handleProfileImageChange, updateUserProfile};
};

export default MyPageViewModel;
