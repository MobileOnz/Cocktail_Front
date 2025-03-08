import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";

const MAIN_CONCEPTS = [
  "혼술하기 좋은", "데이트하기 좋은", "모임하기 좋은",
  "꽃 플레이스", "복고 좋은", "컨셉 & 테마",
  "재즈 & 라이브 뮤직", "클래식한"
];

const SUB_CONCEPTS = [
  "조용한", "고급카 분위기", "사진 맛집",
  "1차로 가기 좋은", "2차로 가기 좋은",
  "루프탑", "주차장", "교통이 편리함"
];

const ICONS = ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣"];

const CreateNewListScreen = () => {
  const [selectedMain, setSelectedMain] = useState(null);
  const [selectedSub, setSelectedSub] = useState([]);
  const [screenState, setScreenState] = useState(1); // 1: 첫 번째 화면, 2: 두 번째 화면

  // 태그 추가 & 삭제 핸들러
  const handleSelectMain = (concept) => {
    if (selectedMain === concept) {
      setSelectedMain(null);
    } else {
      setSelectedMain(concept);
    }
  };

  const handleSelectSub = (concept) => {
    if (selectedSub.includes(concept)) {
      setSelectedSub(selectedSub.filter((item) => item !== concept));
    } else if (selectedSub.length < 3) {
      setSelectedSub([...selectedSub, concept]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>새 리스트 만들기</Text>

      {/* 선택된 태그 UI (두 번째 화면에서 표시) */}
      {screenState === 2 && (
        <View style={styles.selectedTags}>
          {selectedMain && (
            <TouchableOpacity onPress={() => setSelectedMain(null)} style={styles.selectedTag}>
              <Text style={styles.selectedTagText}>{selectedMain} ✖</Text>
            </TouchableOpacity>
          )}
          {selectedSub.map((tag, index) => (
            <TouchableOpacity key={index} onPress={() => handleSelectSub(tag)} style={styles.selectedTag}>
              <Text style={styles.selectedTagText}>{tag} ✖</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 메인 컨셉 선택 */}
      <Text style={styles.sectionTitle}>메인 컨셉 (1개 선택 가능)</Text>
      <FlatList
        data={MAIN_CONCEPTS}
        numColumns={3}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectMain(item)}
            style={[
              styles.conceptButton,
              selectedMain === item && styles.selectedButton
            ]}
          >
            <Text style={[styles.conceptText, selectedMain === item && styles.selectedText]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* 컨셉 아이콘 */}
      <Text style={styles.sectionTitle}>컨셉 아이콘</Text>
      <View style={styles.iconContainer}>
        {ICONS.map((icon, index) => (
          <Text key={index} style={styles.icon}>{icon}</Text>
        ))}
      </View>

      {/* 보조 컨셉 선택 */}
      <Text style={styles.sectionTitle}>보조 컨셉 (최대 3개 선택 가능)</Text>
      <FlatList
        data={SUB_CONCEPTS}
        numColumns={3}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectSub(item)}
            style={[
              styles.conceptButton,
              selectedSub.includes(item) && styles.selectedButton
            ]}
          >
            <Text style={[styles.conceptText, selectedSub.includes(item) && styles.selectedText]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* 저장 버튼 */}
      <TouchableOpacity
        style={[styles.saveButton, (selectedMain || selectedSub.length > 0) && styles.activeSaveButton]}
        onPress={() => setScreenState(2)}
        disabled={!selectedMain && selectedSub.length === 0}
      >
        <Text style={[styles.saveButtonText, (selectedMain || selectedSub.length > 0) && styles.activeSaveButtonText]}>
          저장하기
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateNewListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3EE",
    padding: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 16,
  },
  conceptButton: {
    flex: 1,
    padding: 10,
    margin: 5,
    backgroundColor: "#E8E6E3",
    borderRadius: 20,
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#5A3E85",
  },
  conceptText: {
    fontSize: 14,
    color: "#333",
  },
  selectedText: {
    color: "#FFF",
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  icon: {
    fontSize: 24,
    marginHorizontal: 5,
  },
  selectedTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  selectedTag: {
    backgroundColor: "#5A3E85",
    padding: 8,
    borderRadius: 20,
    margin: 5,
  },
  selectedTagText: {
    color: "#FFF",
    fontSize: 14,
  },
  saveButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#DDD",
  },
  activeSaveButton: {
    backgroundColor: "#5A3E85",
  },
  saveButtonText: {
    fontSize: 16,
    color: "#999",
  },
  activeSaveButtonText: {
    color: "#FFF",
  },
});
