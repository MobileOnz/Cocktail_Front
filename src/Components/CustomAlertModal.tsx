import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Platform } from "react-native";
import { widthPercentage, heightPercentage, fontPercentage, getResponsiveHeight } from "../assets/styles/FigmaScreen";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const CustomAlertModal = ({ visible, message, onCancel, onConfirm }) => {
  if (!visible) return null; // 직접 제어

  return (
    <TouchableWithoutFeedback onPress={onCancel}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <View style={[styles.alertBox, {width: Platform.OS === "ios" ? wp(70) : wp(80)}]}>
            <Text style={styles.message}>{message}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button]} onPress={onConfirm}>
                <Text style={styles.confirmText}>삭제</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.leftBorder]} onPress={onCancel}>
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
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
    height : getResponsiveHeight(300,400,135,170,150,145),
    backgroundColor: "#FFFCF3",
    borderRadius: 12,
   

  },
  message: {
    fontSize: fontPercentage(16),
    fontWeight: "700",
    paddingTop : heightPercentage(24),
    paddingBottom : 24,
    borderBottomWidth : 1,
    borderBottomColor : "#E4DFD8",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    width : "100%",
  },
  cancelButton: {
 
    height : hp(4),
    textAlign : "center",
    textAlignVertical : "center",
    borderRightWidth : 1,
    borderRightColor : "#E4DFD8",
    
  },
  cancelText: {
    color: "#B9B6AD",
    fontWeight: "500",
    fontSize: fontPercentage(16),
  },
  button: {
    width: widthPercentage(129),
    height: heightPercentage(44),
    justifyContent: "center",   // ✅ 수직 중앙
    alignItems: "center",       // ✅ 수평 중앙
  },
  leftBorder: {
    borderLeftWidth: 1,
    borderLeftColor: "#E4DFD8",
  },
  confirmText: {
    color: "#FF465C",
    fontWeight: "500",
    fontSize: fontPercentage(16),
  },
});

export default CustomAlertModal;
