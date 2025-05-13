import React, { useState } from "react";
import { TouchableOpacity, Image, View, StyleSheet, Text } from "react-native";
import CustomAlertModal from "./CustomAlertModal";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import Popover from "react-native-popover-view";
import { Portal } from "react-native-paper";

const MoreOptionMenu = ({ itemId, onEdit, onDelete, message }) => {
  const [visible, setVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <View style={styles.container}>
      <Popover
        isVisible={visible}
        onRequestClose={closeMenu}
        from={
          <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
            <Image
              source={require("../assets/drawable/optionbutton.png")}
              style={styles.menuIcon}
            />
          </TouchableOpacity>
        }
        placement="bottom"
        arrowStyle={{ backgroundColor: "#FFFCF3" }}
        backgroundStyle={{ backgroundColor: "transparent" }}
        popoverStyle={styles.popoverShadow} //그림자 효과 적용
      >
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            onEdit(itemId);
            closeMenu();
          }}
        >
          <View style={styles.menuItemContent}>
            
            <Text style={styles.menuText}>수정하기</Text>
            <Image
              source={require("../assets/drawable/pencil.png")}
              style={styles.icon}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.line} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            setAlertVisible(true);
            closeMenu();
          }}
        >
          <View style={styles.menuItemContent}>
            
            <Text style={styles.menuText}>삭제하기</Text>
            <Image
              source={require("../assets/drawable/trash.png")}
              style={styles.icon}
            />
          </View>
        </TouchableOpacity>
      </Popover>

      {/* 커스텀 알림 모달 */}
      <Portal>
        <CustomAlertModal
        visible={alertVisible}
        message={"나의 리스트에서 \n삭제할까요?"}
        onCancel={() => setAlertVisible(false)}
        onConfirm={() => {
          onDelete(itemId);
          setAlertVisible(false);
        }}
      />
      </Portal>
      
    </View>
  );
};

export default MoreOptionMenu;

const styles = StyleSheet.create({
  line: {
    height: heightPercentage(1),
    backgroundColor: "#B9B6AD",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding : 10
  },
  menuButton: {
    padding: 2,
    width: widthPercentage(30),
    height: heightPercentage(30),
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    width: widthPercentage(4),
    height: heightPercentage(20),
    resizeMode: "contain",
  },
  menuItem: {
    width: widthPercentage(152),
    height: heightPercentage(44),
    justifyContent: "center",
    backgroundColor: "#FFFCF3",
  },
  menuItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: widthPercentage(16),
    width: "100%",
    height: "100%",
  },
  menuText: {
    fontSize: fontPercentage(14),
    fontWeight: "500",
    color: "#2D2D2D",
    marginLeft: 8,
  },
  icon: {
    width: widthPercentage(20),
    height: heightPercentage(20),
    resizeMode: "contain",
  },
  popoverShadow: {
    backgroundColor: "#FFFCF3",
    borderRadius: 8,

    // iOS 그림자
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1, // 하단 그림자
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,

    // Android 그림자
    elevation: 4,
  },
});
