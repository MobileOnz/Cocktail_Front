import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity } from "react-native";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { launchImageLibrary } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImageResizer from "react-native-image-resizer";
import instance from "../tokenRequest/axios_interceptor";

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

  const [selectedImageMeta, setSelectedImageMeta] = useState<{ name: string; type: string } | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await instance.get("/api/get/member");
        const result = res.data;
        console.log("👤 get/member 응답:", result);

        if (result.code === 1) {
          const member = result.data;
          setNickname(member.nickname);
          setNewNickname("");
          console.log("✅ 닉네임 불러오기 완료:", member.nickname);
        } else {
          console.warn("❌ 닉네임 API 실패:", result.msg);
        }
      } catch (error) {
        console.error("❌ 닉네임 불러오기 실패", error);
      }

      try {
        const res = await instance.get("/api/profile", { responseType: "blob" });
        const contentType = res.headers["content-type"];

        if (contentType?.includes("application/json")) {
          const { data } = res.data;
          if (data) {
            const fullUri = data.startsWith("http") ? data : `${res.config.baseURL}${data.startsWith("/") ? "" : "/"}${data}`;
            setProfileUri(fullUri);
            setInitialProfileUri(fullUri);
          }
        } else if (contentType?.startsWith("image/")) {
          const imageUrl = URL.createObjectURL(res.data);
          setProfileUri(imageUrl);
          setInitialProfileUri(imageUrl);
        } else {
          console.warn("❓ 알 수 없는 Content-Type:", contentType);
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
      });

      const result = res.data;
      if (result.code === 1) {
        console.log("✅ 프로필 정보 업데이트 성공", result.data);
        if (isNicknameChanged) {
          setNickname(newNickname);
          setNewNickname("");
        }
        if (isProfileChanged) {
          setInitialProfileUri(profileUri);
        }
      } else {
        console.warn("❌ 프로필 정보 업데이트 실패", result.msg);
      }
    } catch (error) {
      console.error("🔥 프로필 저장 중 에러 발생", error);
    }
  };

  const handleProfileImageChange = async () => {
    launchImageLibrary({ mediaType: "photo", selectionLimit: 1 }, async (response) => {
      if (!response.didCancel && response.assets && response.assets.length > 0) {
        try {
          const asset = response.assets[0];
          console.log("📸 선택된 원본 이미지:", asset);

          const resizedImage = await ImageResizer.createResizedImage(
            asset.uri!,
            400,
            400,
            "PNG",
            80
          );

          const uri = resizedImage.uri;
          setSelectedImageMeta({
            name: `profile_${Date.now()}.png`,
            type: "image/png",
          });

          if (!initialProfileUri) setInitialProfileUri(uri);
          setProfileUri(uri);

          const formData = new FormData();
          formData.append("file", {
            uri: uri.startsWith("file://") ? uri : `file://${uri}`,
            name: `profile_${Date.now()}.png`,
            type: "image/png",
          } as any);

          const uploadRes = await instance.post("/api/upload/profile", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 10000,
          });

          if (uploadRes.data.code === 1) {
            console.log("✅ 즉시 프로필 이미지 업로드 성공");
          } else {
            console.warn("❌ 즉시 업로드 실패:", uploadRes.data?.msg);
          }
        } catch (error) {
          console.error("❌ 이미지 리사이즈/업로드 실패:", error);
        }
      }
    });
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
    position: "relative",
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
    resizeMode: "contain",
  },
});
