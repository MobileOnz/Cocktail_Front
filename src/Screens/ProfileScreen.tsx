import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity } from "react-native";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { API_BASE_URL } from "@env";
import { launchImageLibrary } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ImageResizer from 'react-native-image-resizer';

const safeParseJson = async (res: Response) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("❌ JSON 파싱 실패:", text);
    return null;
  }
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [nickname, setNickname] = useState("현재 닉네임");
  const [newNickname, setNewNickname] = useState("");
  const [profileUri, setProfileUri] = useState<string | null>(null);
  const [initialProfileUri, setInitialProfileUri] = useState<string | null>(null);

  const isNicknameChanged = newNickname.trim() !== "" && newNickname !== nickname;
  const isProfileChanged = profileUri !== initialProfileUri;
  const isChanged = isNicknameChanged || isProfileChanged;

  //이미지의 type, name을 안전하게 지정해주기 위해 상태를 저장하는 변수 추가
  const [selectedImageMeta, setSelectedImageMeta] = useState<{name: string; type: string} | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      console.log("fetchProfileData Token:", token);
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/get/member`, {
          headers: { Authorization: `${token}` },
        });
        const json = await safeParseJson(res);
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
        const profileRes = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `${token}` },
        });

        const contentType = profileRes.headers.get("content-type");

        if (contentType?.includes("application/json")) {
          const profileJson = await safeParseJson(profileRes);
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
          const blob = await profileRes.blob();
          const imageUrl = URL.createObjectURL(blob);

          setProfileUri(imageUrl);
          setInitialProfileUri(imageUrl);

          console.log("📷 이미지 직접 응답으로 설정:", imageUrl);
        } else {
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
      const token = await AsyncStorage.getItem("accessToken");
      console.log("handleSave Token:", token);
      if (!token) {
        console.warn("AccessToken is missing");
        return;
      }

      if (isProfileChanged && profileUri && selectedImageMeta) {
        const formData = new FormData();


        //이미지 업로드용 파일 구조
        formData.append("file", {
          uri: profileUri?.startsWith("file://") ? profileUri : `file://${profileUri}`,
          name: selectedImageMeta.name,
          type: selectedImageMeta.type,
        }as any); //타입 충돌 방지용

        const uploadRes = await fetch(`${API_BASE_URL}/api/upload/profile`, {
          method: "POST",
          headers: { Authorization: `${token}` },
          body: formData,
        });

        const uploadJson = await safeParseJson(uploadRes);
        if (uploadJson?.code === 1) {
          console.log("✅ 프로필 이미지 업로드 성공");
        } else {
          console.warn("❌ 프로필 이미지 업로드 실패", uploadJson?.msg);
        }
      }

      const profileUpdateRes = await fetch(`${API_BASE_URL}/api/update/member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          gender: "none",
          nickName: newNickname || nickname,
          name: "test",
          addr: "seoul",
          age: 20,
          profile: profileUri || "",
        }),
      });

      const profileJson = await safeParseJson(profileUpdateRes);
      if (profileJson?.code === 1) {
        console.log("✅ 프로필 정보 업데이트 성공", profileJson.data);
        if (isNicknameChanged) {
          setNickname(newNickname);
          setNewNickname("");
        }
        if (isProfileChanged) {
          setInitialProfileUri(profileUri);
        }
      } else {
        console.warn("❌ 프로필 정보 업데이트 실패", profileJson?.msg);
      }
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
              800, // 너비 (원본 비율 유지됨)
              800, // 높이
              "PNG", // 포맷 강제 지정
              100 // 품질 (0~100)
            );
  
            const uri = resizedImage.uri;
            console.log("🧩 변환된 png 이미지:", resizedImage);
  
            setSelectedImageMeta({
              name: `profile_${Date.now()}.png`,
              type: "image/png",
            });
  
            if (!initialProfileUri) setInitialProfileUri(uri);
            setProfileUri(uri);
  
          } catch (error) {
            console.error("❌ 이미지 리사이즈 실패:", error);
          }
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../assets/drawable/left-chevron.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 변경</Text>
        <View style={{ width: 28 }} />
      </View>

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

      <View style={styles.nicknameSection}>
        <Text style={styles.nicknameLabel}>닉네임</Text>
        <TextInput
          style={styles.nicknameInput}
          value={newNickname}
          onChangeText={setNewNickname}
          placeholder={nickname}
        />
      </View>

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
  profileWrapper: {
    width: widthPercentage(90),
    height: widthPercentage(90),
    position: "relative", // 자식의 absolute 기준
    alignItems: "center",
    justifyContent: "center",
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
  profileSection: {
    alignItems: "center",
    marginBottom: heightPercentage(30),
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
  backIcon: {
    width: widthPercentage(28),
    height: widthPercentage(28),
    resizeMode: 'contain',
  }
});
