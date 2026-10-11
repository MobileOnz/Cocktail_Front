import React, {useCallback, useEffect, useState} from 'react';
import {AppState, Linking, Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {checkAppUpdate, dismissUpdateNotice, type UpdateCheck} from '../lib/appUpdate';
import {fonts, koreanBreak, night, round, space} from '../lib/theme';

/**
 * 앱 업데이트 안내 / 강제 업데이트.
 * 실행할 때와 백그라운드에서 돌아올 때 확인한다(강제 업데이트를 미루지 못하게).
 */
export default function AppUpdateGate() {
  const [check, setCheck] = useState<UpdateCheck>({kind: 'none'});

  const run = useCallback(() => {
    checkAppUpdate().then(setCheck);
  }, []);

  useEffect(() => {
    run();
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') {
        run();
      }
    });
    return () => sub.remove();
  }, [run]);

  if (check.kind === 'none') {
    return null;
  }

  const force = check.kind === 'force';
  const openStore = () => {
    Linking.openURL(check.storeUrl).catch(() => {});
  };
  const later = () => {
    dismissUpdateNotice(check.latestVersion);
    setCheck({kind: 'none'});
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      // 안드로이드 뒤로가기: 안내는 닫히고, 강제 업데이트는 닫히지 않는다.
      onRequestClose={force ? () => {} : later}>
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <Text style={styles.title} {...koreanBreak}>
            {force ? '업데이트가 필요해요' : '새 버전이 나왔어요'}
          </Text>
          <Text style={styles.body} {...koreanBreak}>
            {force
              ? '지금 버전에서는 온즈를 계속 쓸 수 없어요. 최신 버전으로 업데이트해 주세요.'
              : `온즈 ${check.latestVersion} 버전이 나왔어요. 업데이트하고 새로워진 온즈를 만나 보세요.`}
          </Text>
          <Pressable style={styles.primary} onPress={openStore} accessibilityRole="button">
            <Text style={styles.primaryText}>업데이트하기</Text>
          </Pressable>
          {!force && (
            <Pressable style={styles.secondary} onPress={later} accessibilityRole="button">
              <Text style={styles.secondaryText}>나중에</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: space.xxl,
  },
  box: {
    backgroundColor: night.surface,
    borderRadius: round.md,
    padding: space.xl,
  },
  title: {
    color: night.text,
    fontFamily: fonts.bold,
    fontSize: 18,
    marginBottom: space.sm,
  },
  body: {
    color: night.textDim,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: space.xl,
  },
  primary: {
    backgroundColor: night.accent,
    borderRadius: round.sm,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  primaryText: {
    color: night.onAccent,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  secondary: {
    paddingVertical: space.md,
    alignItems: 'center',
    marginTop: space.xs,
  },
  secondaryText: {
    color: night.textFaint,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
});
