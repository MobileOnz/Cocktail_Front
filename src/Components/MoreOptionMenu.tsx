import React, { useState } from "react";
import { TouchableOpacity, Image, View, StyleSheet, Text } from "react-native";
import CustomAlertModal from "./CustomAlertModal";
import { widthPercentage, heightPercentage, fontPercentage } from "../assets/styles/FigmaScreen";
import Popover from "react-native-popover-view";

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
      >
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            onEdit(itemId);
            closeMenu();
          }}
        >
          <View style={styles.menuItemContent}>
            <Image
              source={require("../assets/drawable/pencil.png")}
              style={styles.icon}
            />
            <Text style={styles.menuText}>수정하기</Text>
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
            <Image
              source={require("../assets/drawable/trash.png")}
              style={styles.icon}
            />
            <Text style={styles.menuText}>삭제하기</Text>
          </View>
        </TouchableOpacity>
      </Popover>

      {/* 커스텀 알림 모달 */}
      <CustomAlertModal
        visible={alertVisible}
        message={"나의 리스트에서 \n삭제할까요?"}
        onCancel={() => setAlertVisible(false)}
        onConfirm={() => {
          onDelete(itemId);
          setAlertVisible(false);
        }}
      />
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
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    width: widthPercentage(4),
    height: heightPercentage(20),
    resizeMode: "contain",
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFCF3",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
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
});
