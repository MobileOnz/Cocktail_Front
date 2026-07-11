// TopRightMenu.tsx
// 우상단 케밥(⋮) 메뉴. 하단 탭에서 빠진 '마이페이지'의 새 진입점이다.
// 탭하면 모달 카드가 열리고, 마이페이지 스택 화면들로 navigate 한다.
// 로그인 여부는 AsyncStorage 토큰 유무로만 가볍게 판단한다(진입 즉시 토스트/에러 없음).
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { widthPercentage, heightPercentage, fontPercentage } from '../../assets/styles/FigmaScreen';

interface Props {
  /** 케밥 점 색. 밝은 배경이면 어둡게, 어두운 배경이면 밝게. 기본 어두움. */
  tint?: string;
}

type Row = { label: string; onPress: () => void; accent?: boolean };

const TopRightMenu: React.FC<Props> = ({ tint = '#1B1B1B' }) => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const openMenu = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      setLoggedIn(!!token);
    } catch {
      setLoggedIn(false);
    }
    setOpen(true);
  }, []);

  const go = useCallback(
    (screen: string, params?: object) => {
      setOpen(false);
      navigation.navigate(screen as never, params as never);
    },
    [navigation],
  );

  const rows: Row[] = [
    loggedIn
      ? { label: '마이페이지', onPress: () => go('MyPageScreen') }
      : { label: '로그인 · 회원가입', onPress: () => go('Login'), accent: true },
    { label: '나의 칵테일 보관함', onPress: () => go('CocktailBoxScreen') },
    { label: '방문한 바', onPress: () => go('VisitedBarsScreen') },
    { label: '1:1 문의하기', onPress: () => go('InquiryFormScreen') },
    { label: '이용약관', onPress: () => go('TermsAndConditionsScreen') },
    { label: '개인정보 처리방침', onPress: () => go('PrivacyPolicyScreen') },
  ];

  return (
    <>
      <TouchableOpacity
        onPress={openMenu}
        accessibilityRole="button"
        accessibilityLabel="메뉴 열기"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <View style={styles.kebab}>
          <View style={[styles.dot, { backgroundColor: tint }]} />
          <View style={[styles.dot, { backgroundColor: tint }]} />
          <View style={[styles.dot, { backgroundColor: tint }]} />
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { top: insets.top + heightPercentage(44) }]}>
            {!loggedIn && (
              <Text style={styles.hint}>로그인하고 보관함·방문기록을 이용해보세요</Text>
            )}
            {rows.map((r, i) => (
              <TouchableOpacity
                key={r.label}
                style={[styles.row, i > 0 && styles.rowBorder]}
                onPress={r.onPress}
                accessibilityRole="button"
                accessibilityLabel={r.label}
              >
                <Text style={[styles.rowText, r.accent && styles.rowTextAccent]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default TopRightMenu;

const styles = StyleSheet.create({
  kebab: {
    width: widthPercentage(24),
    height: widthPercentage(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: widthPercentage(4),
    height: widthPercentage(4),
    borderRadius: widthPercentage(2),
    marginVertical: heightPercentage(1.5),
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  sheet: {
    position: 'absolute',
    right: widthPercentage(16),
    minWidth: widthPercentage(210),
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: heightPercentage(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  hint: {
    paddingHorizontal: widthPercentage(18),
    paddingTop: heightPercentage(10),
    paddingBottom: heightPercentage(6),
    fontSize: fontPercentage(12),
    color: '#9E9E9E',
    fontFamily: 'Pretendard-Medium',
  },
  row: {
    paddingHorizontal: widthPercentage(18),
    paddingVertical: heightPercentage(13),
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  rowText: {
    fontSize: fontPercentage(15),
    color: '#1B1B1B',
    fontFamily: 'Pretendard-Medium',
  },
  rowTextAccent: {
    color: '#1B1B1B',
    fontFamily: 'Pretendard-Bold',
  },
});
