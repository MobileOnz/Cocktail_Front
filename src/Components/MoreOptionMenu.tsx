import React, { useState } from "react";
import { TouchableOpacity, Image, View, StyleSheet } from "react-native";
import { Menu } from "react-native-paper";
import CustomAlertModal from "./CustomAlertModal";
import { widthPercentage, heightPercentage } from "../assets/styles/FigmaScreen";

const MoreOptionMenu = ({ itemId, onEdit, onDelete }) => {
  const [visible, setVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <View style={styles.container}>
      <Menu 
        visible={visible}
        onDismiss={closeMenu}
        contentStyle={styles.menuContent}
        anchor={
          <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
            <Image
              source={require("../assets/drawable/optionbutton.png")}
              style={styles.menuIcon}
            />
          </TouchableOpacity>
        }
      >
        <Menu.Item
          style={styles.menuItem}
          onPress={() => {
            onEdit(itemId);
            closeMenu();
          }}
          title="수정하기"
          leadingIcon={() => (
            <Image
              source={require("../assets/drawable/pencil.png")}
              style={styles.icon}
            />
          )}
        />
        <Menu.Item
          style={styles.menuItem}
          onPress={() => {
            setAlertVisible(true);
            closeMenu();
          }}
          title="삭제하기"
          leadingIcon={() => (
            <Image
              source={require("../assets/drawable/trash.png")}
              style={styles.icon}
            />
          )}
        />
      </Menu>

      {/* 커스텀 알림 모달 */}
      <CustomAlertModal
        visible={alertVisible}
        message="나의 리스트에서 삭제할까요?"
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
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  menuButton: {
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    width: 4,
    height: 20,
    resizeMode: "contain",
  },
  menuContent: {
    backgroundColor: "#FFFCF3",
    borderRadius: 4,
    marginBottom: 30,
  },
  menuItem: {
    width: widthPercentage(152),
    height: heightPercentage(44),
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
});
