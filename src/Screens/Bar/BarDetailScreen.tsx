// src/Screens/Bar/BarDetailScreen.tsx
//
// 바 상세 화면. 가게 정보 + 시그니처 칵테일 + 메뉴판 보기 + 채팅 입장 (Coming Soon) + 방문 토글.

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import instance from '../../tokenRequest/axios_interceptor';
import RemoteImage from '../../Components/common/RemoteImage';
import { bar as barTheme, fonts } from '../../lib/theme';
import { ensureLoggedIn, isAuthError, promptLogin } from '../../lib/auth';

interface BarDetail {
  id: number;
  slug: string;
  nameKo: string;
  nameEn?: string | null;
  address: string;
  lat: number;
  lng: number;
  phone?: string | null;
  description?: string | null;
  heroImage?: string | null;
  hours?: any;
  status: string;
  signatureCocktails: Array<{ id: number; name: string; image: string | null }>;
  isVisited: boolean;
}

const BarDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const slug: string = route.params?.slug ?? '';
  const [bar, setBar] = useState<BarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [visiting, setVisiting] = useState(false);

  const fetchBar = useCallback(async () => {
    try {
      const res = await instance.get(`/api/v2/bars/${slug}`);
      setBar(res.data?.data ?? null);
    } catch (e: any) {
      Alert.alert('오류', e?.response?.data?.msg ?? '바 정보를 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchBar();
  }, [fetchBar]);

  const toggleVisit = async () => {
    if (!bar || visiting) return;
    // 방문 기록은 계정에 쌓이는 데이터다 → 요청을 던져 401 을 받고 나서 알리는 대신,
    // 누르는 순간 로그인 화면으로 안내한다.
    if (!(await ensureLoggedIn(navigation, '방문한 바를 기록하려면 로그인해주세요.'))) {
      return;
    }
    setVisiting(true);
    try {
      if (bar.isVisited) {
        await instance.delete(`/api/v2/bars/${bar.slug}/visit`);
        setBar({ ...bar, isVisited: false });
      } else {
        await instance.post(`/api/v2/bars/${bar.slug}/visit`);
        setBar({ ...bar, isVisited: true });
      }
    } catch (e: any) {
      // 토큰이 있었는데도 서버가 거절한 경우(만료·회수) 역시 로그인으로 보낸다.
      if (isAuthError(e)) {
        promptLogin(navigation, '로그인이 만료됐어요. 다시 로그인해주세요.');
        return;
      }
      Alert.alert('오류', e?.response?.data?.msg ?? '방문 체크에 실패했습니다');
    } finally {
      setVisiting(false);
    }
  };

  const openMenu = () => {
    if (!bar) return;
    // T-23: 백엔드 SSR 을 WebView 로 감싸던 방식을 폐기하고 네이티브 메뉴판으로 이동.
    // 가격 노출은 BarMenuScreen 이 방문 세션(X-Onz-Bar-Session) 으로 게이팅한다.
    navigation.navigate('BarMenuScreen', { slug: bar.slug, barName: bar.nameKo });
  };

  const openChat = () => {
    if (!bar) return;
    navigation.navigate('BarChatScreen', { slug: bar.slug, barName: bar.nameKo });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={barTheme.text} />
      </View>
    );
  }
  if (!bar) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: barTheme.textTertiary }}>바 정보를 찾을 수 없습니다</Text>
      </View>
    );
  }

  return (
    <>
      {/* 검정 배경. 딥링크로 목록을 거치지 않고 바로 들어와도 시계/배터리가 보여야 한다. */}
      <StatusBar barStyle="dark-content" backgroundColor={barTheme.bg} />
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 32 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: barTheme.text, fontSize: 20 }}>←</Text>
        </TouchableOpacity>
      </View>

      {/* heroImage 가 없으면 이전에는 아무것도 안 그려 상단이 검은 빈 영역이었다(QA I-12).
          지금은 항상 같은 높이의 자리를 잡고, 없으면 실루엣 + 가게 이름을 보여준다. */}
      <RemoteImage
        uri={bar.heroImage}
        style={styles.hero}
        resizeMode="cover"
        glyphSize={56}
        label={bar.nameKo}
        accessibilityLabel={`${bar.nameKo} 대표 사진`}
      />

      <View style={styles.body}>
        <Text style={styles.name}>{bar.nameKo}</Text>
        {bar.nameEn ? <Text style={styles.nameEn}>{bar.nameEn}</Text> : null}
        {bar.description ? <Text style={styles.description}>{bar.description}</Text> : null}

        {/* 좌라벨/우값은 라벨 폭(40)만큼 값이 안쪽으로 밀려 본문과 기준선이 어긋난다.
            칵테일 상세와 같이 라벨을 위에 두고 값을 전폭으로 편다. */}
        <View style={styles.metaRow}><Text style={styles.metaLabel}>주소</Text><Text style={styles.metaValue}>{bar.address}</Text></View>
        {bar.phone ? <View style={styles.metaRow}><Text style={styles.metaLabel}>전화</Text><Text style={styles.metaValue}>{bar.phone}</Text></View> : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, bar.isVisited && styles.actionBtnActive]}
            onPress={toggleVisit}
            disabled={visiting}>
            <Text style={[styles.actionText, bar.isVisited && styles.actionTextActive]}>
              {bar.isVisited ? '✓ 방문함' : '방문 체크'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]} onPress={openMenu}>
            <Text style={[styles.actionText, { color: barTheme.textOnLight }]}>메뉴 보기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={openChat}>
            <Text style={styles.actionText}>오픈채팅 입장</Text>
          </TouchableOpacity>
        </View>

        {bar.signatureCocktails && bar.signatureCocktails.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{bar.nameKo}의 시그니처</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {bar.signatureCocktails.map(c => (
                <View key={c.id} style={styles.sigCard}>
                  <RemoteImage
                    uri={c.image}
                    style={styles.sigImg}
                    resizeMode="cover"
                    glyphSize={28}
                    accessibilityLabel={c.name}
                  />
                  <Text style={styles.sigName} numberOfLines={2}>{c.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: barTheme.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 16, paddingTop: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  hero: { width: '100%', height: 220, backgroundColor: barTheme.surfaceHigh },
  body: { padding: 20 },
  name: { color: barTheme.text, fontSize: 26, fontFamily: fonts.bold,},
  nameEn: { color: barTheme.textTertiary, fontFamily: fonts.regular, fontSize: 14, marginTop: 4 },
  description: { color: barTheme.textSecondary, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, marginTop: 12 },
  metaRow: { marginTop: 14 },
  metaLabel: { color: barTheme.textTertiary, fontFamily: fonts.regular, fontSize: 12, marginBottom: 4 },
  metaValue: { color: barTheme.textSecondary, fontFamily: fonts.regular, fontSize: 14 },
  actions: { marginTop: 24, gap: 10 },
  actionBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: barTheme.surfaceHigh,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: barTheme.borderStrong,
  },
  actionBtnActive: { backgroundColor: barTheme.surfaceHigh, borderColor: barTheme.text },
  actionTextActive: { color: barTheme.text },
  primaryBtn: { backgroundColor: barTheme.text, borderColor: barTheme.text },
  disabledBtn: { backgroundColor: barTheme.surface, borderColor: barTheme.surfaceHigh },
  actionText: { color: barTheme.text, fontSize: 15, fontFamily: fonts.medium,},
  section: { marginTop: 28 },
  sectionTitle: { color: barTheme.text, fontSize: 16, fontFamily: fonts.medium, marginBottom: 12 },
  sigCard: { width: 130 },
  sigImg: { width: 130, height: 130, borderRadius: 12, backgroundColor: barTheme.surfaceHigh },
  sigName: { color: barTheme.textSecondary, fontFamily: fonts.regular, fontSize: 13, marginTop: 8 },
});

export default BarDetailScreen;
