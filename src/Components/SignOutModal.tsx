// Components/SignOutModal.tsx
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { widthPercentage, heightPercentage, fontPercentage } from '../assets/styles/FigmaScreen';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

const SignOutModal = ({ visible, onClose, onSignOut }: Props) => {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.message}>로그아웃 하시겠어요?</Text>
          <View style={styles.divider} />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.singleButton} onPress={onClose}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <View style={styles.verticalDivider} />
            <TouchableOpacity style={styles.singleButton} onPress={onSignOut}>
              <Text style={styles.confirmText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: widthPercentage(280),
    backgroundColor: '#fffaf6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  message: {
    fontSize: fontPercentage(16),
    color: '#2D2D2D',
    textAlign: 'center',
    paddingVertical: heightPercentage(20),
    fontFamily: 'Pretendard-Bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  buttonRow: {
    flexDirection: 'row',
    height: heightPercentage(50),
  },
  singleButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: fontPercentage(16),
    color: '#7D7A6F',
    fontFamily: 'Pretendard-Medium',
},
  confirmText: {
    fontSize: fontPercentage(16),
    color: '#FF5A5A',
    fontFamily: 'Pretendard-Medium',
  },
});

export default SignOutModal;