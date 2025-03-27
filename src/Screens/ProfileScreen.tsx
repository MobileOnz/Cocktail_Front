import React, { useState, useEffect} from "react";
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity } from "react-native";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

import { launchImageLibrary } from "react-native-image-picker";

import AsyncStorage from "@react-native-async-storage/async-storage";
const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [nickname, setNickname] = useState("현재 닉네임");
  const [newNickname, setNewNickname] = useState("");

  const isNicknameChanged = newNickname.trim() !== "" && newNickname !== nickname;
  const isProfileChanged = profileUri !== initialProfileUri;
  const isChanged = isNicknameChanged || isProfileChanged;

  const [profileUri, setProfileUri] = useState<string | null>(null); // 현재 선택된 이미지
  const [initialProfileUri, setInitialProfileUri] = useState<string | null>(null); // 원래 이미지


  useEffect(() => {
    const fetchProfileData = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;
  
      try {
        // 회원 기본 정보 불러오기
        const res = await fetch("http://localhost:8080/api/public/cocktail/get/member", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (json.code === 1) {
          const member = json.data;
          setNickname(member.nickname);
          setNewNickname("");
          console.log("✅ 닉네임 불러오기 완료:", member.nickname);
        }
      } catch (error) {
        console.error("❌ 닉네임 불러오기 실패", error);
      }
  
      try {
        // 🔥 프로필 이미지 따로 불러오기
        const profileRes = await fetch("http://localhost:8080/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const profileText = await profileRes.text(); // 이미지 URL이 그냥 문자열로 올 경우
        if (profileText) {
          setProfileUri(profileText);
          setInitialProfileUri(profileText);
          console.log("✅ 프로필 이미지 불러오기 완료:", profileText);
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
      if (!token) {
        console.warn("AccessToken is missing");
        return;
      }
  
      // 1. 프로필 이미지 변경 시 먼저 업로드
      if (isProfileChanged && profileUri) {
        const formData = new FormData();
        formData.append("file", {
          uri: profileUri,
          type: "image/jpeg",
          name: "profile.jpg",
        });
  
        const uploadRes = await fetch("http://localhost:8080/api/public/upload/profile", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
  
        const uploadJson = await uploadRes.json();
        if (uploadJson.code === 1) {
          console.log("✅ 프로필 이미지 업로드 성공");
        } else {
          console.warn("❌ 프로필 이미지 업로드 실패", uploadJson.msg);
        }
      }
  
      // 2. 프로필 정보 업데이트
      const profileUpdateRes = await fetch("http://localhost:8080/api/update/member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
  
      const profileJson = await profileUpdateRes.json();
      if (profileJson.code === 1) {
        console.log("✅ 프로필 정보 업데이트 성공", profileJson.data);
        if (isNicknameChanged) {
          setNickname(newNickname);
          setNewNickname("");
        }
        if (isProfileChanged) {
          setInitialProfileUri(profileUri);
        }
      } else {
        console.warn("❌ 프로필 정보 업데이트 실패", profileJson.msg);
      }
    } catch (error) {
      console.error("🔥 프로필 저장 중 에러 발생", error);
    }
  };
  
  
  

  const handleProfileImageChange = async () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        selectionLimit: 1,
      },
      (response) => {
        if (!response.didCancel && response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri;
          if (!initialProfileUri) {
            setInitialProfileUri(uri || null); // 최초 선택 시 초기값 저장
          }
          setProfileUri(uri || null);
        }
      }
    );
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../assets/drawable/left-chevron.png")}
            style={styles.backIcon}
          />
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
          <Image
            source={require("../assets/drawable/edit_icon.png")}
            style={styles.editIcon}
          />
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
          style={[styles.saveButtonText, isChanged ? styles.activeButtonText : styles.disabledButtonText]}
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
