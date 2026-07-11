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
      Alert.alert(
        '오류',
        e?.response?.data?.msg ?? '방문 체크에 실패했습니다 (로그인이 필요할 수 있습니다)',
      );
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
        <ActivityIndicator color="#fff" />
      </View>
    );
  }
  if (!bar) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: '#888' }}>바 정보를 찾을 수 없습니다</Text>
      </View>
    );
  }

  return (
    <>
      {/* 검정 배경. 딥링크로 목록을 거치지 않고 바로 들어와도 시계/배터리가 보여야 한다. */}
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 32 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
        </TouchableOpacity>
      </View>

      {/* heroImage 가 없으면 이전에는 아무것도 안 그려 상단이 검은 빈 영역이었다(QA I-12).
          지금은 항상 같은 높이의 자리를 잡고, 없으면 실루엣 + 가게 이름을 보여준다. */}
      <RemoteImage
        uri={bar.heroImage}
        style={styles.hero}
        resizeMode="cover"
        tone="dark"
        glyphSize={56}
        label={bar.nameKo}
        accessibilityLabel={`${bar.nameKo} 대표 사진`}
      />

      <View style={styles.body}>
        <Text style={styles.name}>{bar.nameKo}</Text>
        {bar.nameEn ? <Text style={styles.nameEn}>{bar.nameEn}</Text> : null}
        {bar.description ? <Text style={styles.description}>{bar.description}</Text> : null}

        <View style={styles.row}><Text style={styles.kAddr}>주소</Text><Text style={styles.vAddr}>{bar.address}</Text></View>
        {bar.phone ? <View style={styles.row}><Text style={styles.kAddr}>전화</Text><Text style={styles.vAddr}>{bar.phone}</Text></View> : null}

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
            <Text style={[styles.actionText, { color: '#000' }]}>메뉴 보기</Text>
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
                    tone="dark"
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
  container: { flex: 1, backgroundColor: '#000' },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 16, paddingTop: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  hero: { width: '100%', height: 220, backgroundColor: '#161616' },
  body: { padding: 20 },
  name: { color: '#fff', fontSize: 26, fontWeight: '700' },
  nameEn: { color: '#aaa', fontSize: 14, marginTop: 4 },
  description: { color: '#ccc', fontSize: 14, lineHeight: 22, marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 14, gap: 12 },
  kAddr: { color: '#888', fontSize: 13, width: 40 },
  vAddr: { color: '#ccc', fontSize: 13, flex: 1 },
  actions: { marginTop: 24, gap: 10 },
  actionBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  actionBtnActive: { backgroundColor: '#1f1f1f', borderColor: '#fff' },
  actionTextActive: { color: '#fff' },
  primaryBtn: { backgroundColor: '#fff', borderColor: '#fff' },
  disabledBtn: { backgroundColor: '#0c0c0c', borderColor: '#1a1a1a' },
  actionText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  section: { marginTop: 28 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  sigCard: { width: 130 },
  sigImg: { width: 130, height: 130, borderRadius: 12, backgroundColor: '#1a1a1a' },
  sigName: { color: '#ddd', fontSize: 13, marginTop: 8 },
});

export default BarDetailScreen;
