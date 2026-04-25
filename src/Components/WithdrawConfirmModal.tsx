// Components/WithdrawConfirmModal.tsx
// 회원 탈퇴 확인 모달. SignOutModal 패턴을 그대로 따른다.
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { widthPercentage, heightPercentage, fontPercentage } from '../assets/styles/FigmaScreen';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const WithdrawConfirmModal = ({ visible, onClose, onConfirm }: Props) => {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>정말로 회원 탈퇴하시겠습니까?</Text>
          <Text style={styles.message}>이 작업은 되돌릴 수 없습니다.</Text>
          <View style={styles.divider} />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.singleButton} onPress={onClose}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <View style={styles.verticalDivider} />
            <TouchableOpacity style={styles.singleButton} onPress={onConfirm}>
              <Text style={styles.confirmText}>탈퇴하기</Text>
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
  title: {
    fontSize: fontPercentage(16),
    color: '#2D2D2D',
    textAlign: 'center',
    paddingTop: heightPercentage(20),
    paddingHorizontal: widthPercentage(16),
    fontFamily: 'Pretendard-Bold',
  },
  message: {
    fontSize: fontPercentage(14),
    color: '#7D7A6F',
    textAlign: 'center',
    paddingTop: heightPercentage(8),
    paddingBottom: heightPercentage(20),
    paddingHorizontal: widthPercentage(16),
    fontFamily: 'Pretendard-Medium',
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

export default WithdrawConfirmModal;
