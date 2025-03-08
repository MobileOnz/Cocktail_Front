import React from "react";
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");

interface CocktailDetailModalProps {
  visible: boolean;
  onClose: () => void;
  cocktail: {
    name: string;
    description: string;
    image: any; // require로 전달될 경우 any 타입을 사용
    size: string;
    taste: string;
    alcohol: string;
    recommendation: string;
    ingredients: string;
  };
}

const CocktailDetailModal: React.FC<CocktailDetailModalProps> = ({
  visible,
  onClose,
  cocktail,
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 닫기 버튼 */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={30} color="#000" />
          </TouchableOpacity>

          {/* 칵테일 이미지 */}
          <Image source={cocktail.image} style={styles.cocktailImage} />

          {/* 칵테일 정보 */}
          <Text style={styles.cocktailName}>{cocktail.name}</Text>
          <Text style={styles.cocktailDescription}>{cocktail.description}</Text>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>기본 정보</Text>
            <Text style={styles.infoText}>잔 크기: {cocktail.size}</Text>
            <Text style={styles.infoText}>기본 맛: {cocktail.taste}</Text>
            <Text style={styles.infoText}>도수: {cocktail.alcohol}</Text>
            <Text style={styles.infoText}>추천 상황: {cocktail.recommendation}</Text>
            <Text style={styles.infoText}>재료: {cocktail.ingredients}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.8,
    backgroundColor: "#FAF9F6",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  cocktailImage: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: "cover",
  },
  cocktailName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cocktailDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  infoContainer: {
    width: "100%",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default CocktailDetailModal;
