import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import { useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from "react-native-image-picker";
import ImageResizer from "react-native-image-resizer";
import instance from "../tokenRequest/axios_interceptor";
import { API_BASE_URL } from "@env";


const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [nickname, setNickname] = useState("현재 닉네임");
  const [newNickname, setNewNickname] = useState("");
  const [profileUri, setProfileUri] = useState<string | null>(null);
  const [initialProfileUri, setInitialProfileUri] = useState<string | null>(null);

  const inputAccessoryViewID = "nicknameInputAccessory";

  const isNicknameChanged = newNickname.trim() !== "" && newNickname !== nickname;
  const isProfileChanged = profileUri !== initialProfileUri;
  const isChanged = isNicknameChanged || isProfileChanged;


  const colorScheme = useColorScheme();

  useEffect(() => {
    const fetchProfileData = async () => {
  
      try {
       const res = await instance.get("/api/get/member", {
          authRequired: true,
        });
  
        const json = res.data;
        console.log("👤 get/member 응답:", json);
  
        if (json && json.code === 1) {
          const member = json.data;
          setNickname(member.nickname);
          setNewNickname("");
          console.log("✅ 닉네임 불러오기 완료:", member.nickname);
        } else {
          console.warn("❌ 닉네임 API 실패:", json?.msg || json);
        }
      } catch (error) {
        console.error("❌ 닉네임 불러오기 실패", error);
      }
  
      try {
        const profileRes = await instance.get("/api/profile", {
          responseType: "blob",
        });
  
        const contentType = profileRes.headers["content-type"];
  
        if (contentType?.includes("application/json")) {
          // blob -> text -> json 파싱
          const text = await profileRes.data.text();
          const profileJson = JSON.parse(text);
          console.log("📷 프로필 응답 (JSON):", profileJson);
  
          if (profileJson && profileJson.code === 1 && profileJson.data) {
            const profileUrl = profileJson.data;
            const fullUri = profileUrl.startsWith("http")
              ? profileUrl
              : `${API_BASE_URL}${profileUrl.startsWith("/") ? "" : "/"}${profileUrl}`;
  
            setProfileUri(fullUri);
            setInitialProfileUri(fullUri);
  
            const short = fullUri.length > 100 ? fullUri.slice(0, 100) + "..." : fullUri;
            console.log("✅ 프로필 이미지 불러오기 완료:", short);
          } else {
            console.warn("❌ 프로필 이미지 API 실패:", profileJson?.msg || profileJson);
          }
  
        } else if (contentType?.startsWith("image/")) {
          const blob = profileRes.data;
        
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            setProfileUri(base64data);
            setInitialProfileUri(base64data);
            console.log("📷 Base64 이미지 설정 완료");
          };
          reader.readAsDataURL(blob);
        }
         else {
          console.warn("❓ 알 수 없는 Content-Type 응답:", contentType);
        }
  
      } catch (error) {
        console.error("❌ 프로필 이미지 불러오기 실패", error);
      }
    };
  
    fetchProfileData();
  }, []);

  

  const handleSave = async () => {
    if (!isChanged) return;

    try {
      const res = await instance.post("/api/update/member", {
        gender: "none",
        nickName: newNickname || nickname,
        name: "test",
        addr: "seoul",
        age: 20,
      },
      {
        authRequired : true,
      }
    );

      const result = res.data;
      if (result.code === 1) {
        if (isNicknameChanged) {
          setNickname(newNickname);
          setNewNickname("");
        }
        if (isProfileChanged) {
          setInitialProfileUri(profileUri);
        }
      }
      navigation.goBack();
    } catch (error) {
      console.error("🔥 프로필 저장 중 에러 발생", error);
    }
  };

  const handleProfileImageChange = async () => {
    launchImageLibrary(
      { mediaType: "photo", selectionLimit: 1 },
      async (response) => {
        if (!response.didCancel && response.assets && response.assets.length > 0) {
          try {
            const asset = response.assets[0];
            console.log("📸 선택된 원본 이미지:", asset);
  
            const resizedImage = await ImageResizer.createResizedImage(
              asset.uri!,
              400, // 너비 (원본 비율 유지됨)
              400, // 높이
              "PNG", // 포맷 강제 지정
              80 // 품질 (0~100)
            );
  
            const uri = resizedImage.uri;
  
  
            if (!initialProfileUri) setInitialProfileUri(uri);
            setProfileUri(uri);
  
            // ✅ 여기서 즉시 업로드 (instance 사용)
            const formData = new FormData();
            formData.append("file", {
              uri: uri.startsWith("file://") ? uri : `file://${uri}`,
              name: `profile_${Date.now()}.png`,
              type: "image/png",
            } as any);
  
            const uploadRes = await instance.post("/api/upload/profile", formData, {
              headers: {
                "Content-Type": "multipart/form-data", // FormData일 땐 직접 설정
              },
              timeout: 10000,
              authRequired: true,
            });
  
            const uploadJson = uploadRes.data;
            if (uploadJson?.code === 1) {
              console.log("✅ 즉시 프로필 이미지 업로드 성공");
            } else {
              console.warn("❌ 즉시 업로드 실패:", uploadJson?.msg);
            }
          } catch (error) {
            console.error("❌ 이미지 리사이즈 실패 또는 업로드 오류:", error);
          }
        }
      }
    );
  };


  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../assets/drawable/left-chevron.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 변경</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* 프로필 이미지 */}
      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.profileWrapper} onPress={handleProfileImageChange}>
          <Image
            source={
              profileUri
                ? { uri: profileUri }
                : require("../assets/drawable/default_profile.png")
            }
            style={styles.profileImage}
          />
          <Image source={require("../assets/drawable/edit_icon.png")} style={styles.editIcon} />
        </TouchableOpacity>
      </View>

      {/* 닉네임 입력 */}
      <View style={styles.nicknameSection}>
        <Text style={styles.nicknameLabel}>닉네임</Text>
        <TextInput
          style={styles.nicknameInput}
          value={newNickname}
          onChangeText={setNewNickname}
          placeholder={nickname}
          returnKeyType="default"
          inputAccessoryViewID={inputAccessoryViewID}
          keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
        />
      </View>

      {/* 키보드 상단 '완료' 버튼 (iOS 한정) */}
      {Platform.OS === "ios" && (
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


      {/* 저장하기 버튼 */}
      <TouchableOpacity
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
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: widthPercentage(16),
    paddingTop: heightPercentage(60),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: heightPercentage(44),
    marginTop: heightPercentage(20),
  },
  headerTitle: {
    fontSize: fontPercentage(20),
    fontWeight: "bold",
    color: "#000",
  },
  backIcon: {
    width: widthPercentage(28),
    height: widthPercentage(28),
    resizeMode: "contain",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: heightPercentage(30),
  },
  profileWrapper: {
    width: widthPercentage(90),
    height: widthPercentage(90),
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: widthPercentage(90),
    height: widthPercentage(90),
    borderRadius: widthPercentage(45),
    backgroundColor: "#DDD",
  },
  editIcon: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: widthPercentage(24),
    height: widthPercentage(24),
    resizeMode: "contain",
    backgroundColor: "#F3EFE6",
    borderRadius: widthPercentage(12),
  },
  nicknameSection: {
    width: widthPercentage(343),
    marginBottom: heightPercentage(20),
  },
  nicknameLabel: {
    fontSize: fontPercentage(12),
    color: "#7D7A6F",
    marginBottom: heightPercentage(8),
  },
  nicknameInput: {
    fontSize: fontPercentage(16),
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: heightPercentage(8),
  },
  saveButton: {
    position: "absolute",
    bottom: heightPercentage(50),
    width: widthPercentage(343),
    height: heightPercentage(48),
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  activeButton: {
    backgroundColor: "#21103C",
  },
  disabledButton: {
    backgroundColor: "#F3EFE6",
  },
  saveButtonText: {
    fontSize: fontPercentage(16),
    fontWeight: "bold",
  },
  activeButtonText: {
    color: "#FFFFFF",
  },
  disabledButtonText: {
    color: "#C1C1C1",
  },
  accessory: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: widthPercentage(16),
    paddingVertical: heightPercentage(10),
    backgroundColor: "#F3EFE6",
    borderTopWidth: 1,
    borderColor: "#DCDCDC",
  },
  doneButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#21103C",
    borderRadius: 8,
  },
  accessoryDoneText: {
    fontSize: fontPercentage(16),
    fontWeight: "500",
    color: "#007AFF", // iOS 기본 파란 텍스트
  },
  accessoryLight: {
    backgroundColor: '#F3EFE6', // 밝은 테마용 배경
  },
  accessoryDark: {
    backgroundColor: '#2C2C2E', // 다크모드 키보드 배경에 맞춘 어두운 배경 (iOS 기본 다크와 유사)
  },
});
