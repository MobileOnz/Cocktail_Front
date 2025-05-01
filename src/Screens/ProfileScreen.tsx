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
  InputAccessoryView, // <- 여기
} from "react-native";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import { useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from "react-native-image-picker";
import ImageResizer from "react-native-image-resizer";
import instance from "../tokenRequest/axios_interceptor";

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

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await instance.get("/api/get/member");
        const result = res.data;
        if (result.code === 1) {
          const member = result.data;
          setNickname(member.nickname);
          setNewNickname("");
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
        if (isNicknameChanged) {
          setNickname(newNickname);
          setNewNickname("");
        }
        if (isProfileChanged) {
          setInitialProfileUri(profileUri);
        }
      }
    } catch (error) {
      console.error("🔥 프로필 저장 중 에러 발생", error);
    }
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
        <TouchableOpacity style={styles.profileWrapper}>
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
        />
      </View>

      {/* 키보드 상단 '완료' 버튼 (iOS 한정) */}
      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={styles.accessory}>
            {/* 좌측 화살표들 생략 가능 */}
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={Keyboard.dismiss}>
              <Text style={styles.accessoryDoneText}>완료</Text>
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
});
