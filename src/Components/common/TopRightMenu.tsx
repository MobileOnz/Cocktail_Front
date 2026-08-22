// TopRightMenu.tsx
// 우상단 메뉴. 하단 탭에서 빠진 '마이페이지'의 새 진입점이다.
// 탭하면 모달 카드가 열리고, 마이페이지 스택 화면들로 navigate 한다.
// 로그인 여부는 AsyncStorage 토큰 유무로만 가볍게 판단한다(진입 즉시 토스트/에러 없음).
//
// QA(데모): "기능 파악이 어려움" — 레이블 없는 점 3개(⋮)라 무엇이 열리는지 읽히지 않았다.
// → 트리거를 원형 버튼 + 사람 아이콘으로 바꿔 '내 계정/메뉴'임을 형태로 알리고,
//   시트 안도 섹션 + 아이콘 + 셰브런으로 스캔 가능하게 만들었다.
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, fonts, fontSize, radius } from '../../lib/theme';
import { widthPercentage, heightPercentage, fontPercentage } from '../../assets/styles/FigmaScreen';

interface Props {
  /** 아이콘 색. 밝은 배경이면 어둡게, 어두운 배경이면 밝게. 기본 어두움. */
  tint?: string;
}

type Row = {
  label: string;
  icon: string;
  onPress: () => void;
  accent?: boolean;
};

type Section = { title: string; rows: Row[] };

const TopRightMenu: React.FC<Props> = ({ tint = colors.text }) => {
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

  const sections: Section[] = [
    {
      title: '계정',
      rows: [
        loggedIn
          ? { label: '마이페이지', icon: 'person-outline', onPress: () => go('MyPageScreen') }
          : {
              label: '로그인 · 회원가입',
              icon: 'log-in-outline',
              onPress: () => go('Login'),
              accent: true,
            },
      ],
    },
    {
      title: '내 활동',
      rows: [
        {
          label: '나의 칵테일 보관함',
          icon: 'bookmark-outline',
          onPress: () => go('CocktailBoxScreen'),
        },
        { label: '방문한 바', icon: 'location-outline', onPress: () => go('VisitedBarsScreen') },
      ],
    },
    {
      title: '지원 · 약관',
      rows: [
        {
          label: '1:1 문의하기',
          icon: 'chatbubble-ellipses-outline',
          onPress: () => go('InquiryFormScreen'),
        },
        {
          label: '이용약관',
          icon: 'document-text-outline',
          onPress: () => go('TermsAndConditionsScreen'),
        },
        {
          label: '개인정보 처리방침',
          icon: 'shield-checkmark-outline',
          onPress: () => go('PrivacyPolicyScreen'),
        },
      ],
    },
  ];

  return (
    <>
      <TouchableOpacity
        onPress={openMenu}
        accessibilityRole="button"
        accessibilityLabel="내 메뉴 열기"
        accessibilityHint="마이페이지, 보관함, 문의, 약관으로 이동합니다"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={styles.trigger}
      >
        <Icon name="person-outline" size={20} color={tint} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { top: insets.top + heightPercentage(44) }]}>
            {!loggedIn && (
              <Text style={styles.hint}>로그인하고 보관함·방문기록을 이용해보세요</Text>
            )}
            {sections.map((section, si) => (
              <View key={section.title} style={si > 0 && styles.sectionDivider}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.rows.map(r => (
                  <TouchableOpacity
                    key={r.label}
                    style={styles.row}
                    onPress={r.onPress}
                    accessibilityRole="button"
                    accessibilityLabel={r.label}
                  >
                    <Icon
                      name={r.icon}
                      size={18}
                      color={r.accent ? colors.text : colors.textSecondary}
                      style={styles.rowIcon}
                    />
                    <Text style={[styles.rowText, r.accent && styles.rowTextAccent]}>{r.label}</Text>
                    <Icon name="chevron-forward" size={16} color={colors.textDisabled} />
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default TopRightMenu;

const styles = StyleSheet.create({
  trigger: {
    width: widthPercentage(36),
    height: widthPercentage(36),
    borderRadius: widthPercentage(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgMuted,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  sheet: {
    position: 'absolute',
    right: widthPercentage(16),
    minWidth: widthPercentage(232),
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    paddingVertical: heightPercentage(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  hint: {
    paddingHorizontal: widthPercentage(18),
    paddingTop: heightPercentage(12),
    paddingBottom: heightPercentage(4),
    fontSize: fontPercentage(fontSize.xs),
    color: colors.textTertiary,
    fontFamily: fonts.medium,
  },
  sectionDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    marginTop: heightPercentage(4),
  },
  sectionTitle: {
    paddingHorizontal: widthPercentage(18),
    paddingTop: heightPercentage(12),
    paddingBottom: heightPercentage(4),
    fontSize: fontPercentage(11),
    color: colors.textTertiary,
    fontFamily: fonts.semibold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: widthPercentage(18),
    paddingVertical: heightPercentage(11),
  },
  rowIcon: {
    marginRight: widthPercentage(10),
  },
  rowText: {
    flex: 1,
    fontSize: fontPercentage(fontSize.base),
    color: colors.text,
    fontFamily: fonts.regular,
  },
  rowTextAccent: {
    fontFamily: fonts.bold,
  },
});
