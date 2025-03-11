import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";

const CustomAlertModal = ({ visible, message, onCancel, onConfirm }) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCancel}>
        <View style={styles.alertBox}>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={[styles.cancelText, styles.cancelButton]}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm}>
              <Text style={[styles.confirmText,styles.selectButton ]}>삭제</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#2D2D2D4D",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: widthPercentage(259),
    height : heightPercentage(140),
    backgroundColor: "#FFFCF3",
    borderRadius: 12,
    alignItems: "center",

  },
  message: {
    fontSize: fontPercentage(16),
    fontWeight: "700",
    paddingTop : heightPercentage(24),
    paddingHorizontal : widthPercentage(54),
    paddingBottom : 24,
    borderBottomColor : "#E4DFD8",
    borderWidth : 1,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width : "100%",
  },
  cancelButton: {
    width : widthPercentage(129),
    height : heightPercentage(44),
    textAlign : "center",
    textAlignVertical : "center",
    borderRightWidth : 1,
    borderRightColor : "#E4DFD8",
    
  },
  selectButton: {
    width : widthPercentage(129),
    height : heightPercentage(44),
    textAlign : "center",
    textAlignVertical : "center",
  },
  cancelText: {
    color: "#B9B6AD",
    fontWeight: "500",
    fontSize: fontPercentage(16),
  },
  confirmText: {
    color: "#FF465C",
    fontWeight: "500",
    fontSize: fontPercentage(16),
  },
});

export default CustomAlertModal;
