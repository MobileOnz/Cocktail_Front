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
          if (member.profile) {
            setProfileUri(member.profile);
            setInitialProfileUri(member.profile);
          }
          console.log("login 정보 : ", member.nickname, member.profile);
        }
      } catch (error) {
        console.error("Failed to fetch member info", error);
      }
    };

    fetchProfileData();
  }, []);

  const handleSave = () => {
    if (isChanged) {
      if (isNicknameChanged) {
        setNickname(newNickname);
        setNewNickname("");
      }
      if (isProfileChanged) {
        setInitialProfileUri(profileUri); // 저장 후 새 프로필을 초기값으로 반영
      }
  
      // TODO: 서버 업로드 로직 필요 시 추가!
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
