import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import Modal from "react-native-modal";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";

interface WithdrawBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onWithdraw: () => void;
}

const WithdrawBottomSheet: React.FC<WithdrawBottomSheetProps> = ({ isVisible, onClose, onWithdraw }) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.3}
    >
      <View style={styles.container}>
        <Text style={styles.title}>회원 탈퇴</Text>
        <Image
          source={require("../assets/drawable/delete_account.png")}
          style={styles.imagePlaceholder}
          resizeMode="contain"
        />
        <Text style={styles.subTitle}>정말 떠나시는 건가요?</Text>
        <Text style={styles.description}>모든 기록은 삭제되고 계정은 복구할 수 없어요.</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.withdrawButton} onPress={onWithdraw}>
            <Text style={styles.withdrawText}>탈퇴하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default WithdrawBottomSheet;

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  container: {
    backgroundColor: "#FFFCF3",
    alignItems: "center",
    padding: widthPercentage(16),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: fontPercentage(18),
    fontWeight: "bold",
    marginBottom: heightPercentage(16),
  },
  imagePlaceholder: {
    width: widthPercentage(296),
    height: heightPercentage(161),
    borderRadius: 20,
    marginBottom: heightPercentage(16),
  },
  subTitle: {
    fontSize: fontPercentage(18),
    fontWeight: "bold",
    marginBottom: heightPercentage(8),
  },
  description: {
    fontSize: fontPercentage(14),
    color: "#7D7A6F",
    marginBottom: heightPercentage(24),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    width: widthPercentage(166),
    height: heightPercentage(57),
    backgroundColor: "#E4DFD8",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    fontSize: fontPercentage(16),
    color: "#7D7A6F",
    fontWeight: "bold",
  },
  withdrawButton: {
    width: widthPercentage(166),
    height: heightPercentage(57),
    backgroundColor: "#F05656",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  withdrawText: {
    fontSize: fontPercentage(16),
    color: "#fff",
    fontWeight: "bold",
  },
});
