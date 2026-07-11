// src/Screens/Bar/BarChatScreen.tsx
//
// 매장 익명 채팅 (T-24).
//
// 이전 버전은 화면이 직접 위치 권한을 받고 /chat/enter 를 호출했다. 그 엔드포인트는 없어졌다.
// 지금 구조는 이렇다:
//
//   T-22(s2)   방문 세션 발급 (QR/GPS) ──> BarSessionStore.set(slug, session)
//   T-24(여기) BarSessionStore.get(slug) ──> ChatTransport ──> SSE (실패 시 폴링)
//
// 즉 이 화면은 위치를 다루지 않는다. 저장된 세션을 읽어 쓸 뿐이다.
// 채팅은 trustLevel >= L1 이면 된다. QR(L2)은 가격에만 필요하다.
//
// 익명성: 서버의 bar_chat_message 에는 member_id 가 없다. 우리가 아는 건 authorRef 뿐이고,
// 차단도 authorRef 기준이다. 그래서 이 화면은 누가 누군지 알 방법이 없다 — 의도된 것이다.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import instance from '../../tokenRequest/axios_interceptor';
import { getToken } from '../../tokenRequest/Token';
import {
  BarSession,
  ChatFatalError,
  ChatMessage,
  ChatTransport,
  ConnectionState,
  TransportKind,
  canChat,
  getBarSessionStore,
  isBarSessionStoreReady,
  needsReauth,
} from '../../services/ChatTransport';
import { createChatTransport } from '../../services/SseTransport';

const SESSION_HEADER = 'X-Onz-Bar-Session';

type Phase = 'loading' | 'needsSession' | 'ready' | 'denied';

const REPORT_REASONS: { key: string; label: string }[] = [
  { key: 'SPAM', label: '스팸/도배' },
  { key: 'ABUSE', label: '욕설/혐오' },
  { key: 'SEXUAL', label: '성적인 내용' },
  { key: 'ADVERTISE', label: '광고/홍보' },
  { key: 'OTHER', label: '기타' },
];

function formatTime(iso: string): string {
  if (!iso) {
    return '';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** 배지 문구. 사용자는 SSE 라는 말을 알 필요가 없다. */
function badgeOf(state: ConnectionState, kind: TransportKind): { text: string; color: string } {
  if (state === 'open') {
    return { text: '연결됨', color: '#3ddc84' };
  }
  if (state === 'polling') {
    return { text: kind === 'poll' ? '폴링' : '연결됨', color: '#e0a341' };
  }
  if (state === 'connecting' || state === 'reconnecting') {
    return { text: '재연결중', color: '#e0a341' };
  }
  return { text: '연결 끊김', color: '#8a8a8a' };
}

const BarChatScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params ?? {}) as { slug?: string; barName?: string };
  const slug = params.slug ?? '';
  const barName = params.barName ?? '오픈채팅';

  const [phase, setPhase] = useState<Phase>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [session, setSession] = useState<BarSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [connState, setConnState] = useState<ConnectionState>('connecting');
  const [connKind, setConnKind] = useState<TransportKind>('sse');
  const [reportTarget, setReportTarget] = useState<ChatMessage | null>(null);

  const listRef = useRef<FlatList<ChatMessage>>(null);
  const transportRef = useRef<ChatTransport | null>(null);
  /** 재진입 시 이어받을 커서. transport 를 새로 만들 때 넘긴다. */
  const cursorRef = useRef<number | null>(null);

  // ── 메시지 병합 ──────────────────────────────────────────────────────────
  // SSE 백필과 라이브가 겹칠 수 있고, 폴링 강등 시에도 경계에서 중복이 날 수 있다.
  // id 로 멱등하게 합친다.
  const upsert = useCallback((incoming: ChatMessage) => {
    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === incoming.id);
      if (idx >= 0) {
        const next = prev.slice();
        next[idx] = incoming;
        return next;
      }
      const next = prev.concat(incoming);
      next.sort((a, b) => a.id - b.id);
      return next;
    });
  }, []);

  const markHidden = useCallback((id: number) => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, status: 'HIDDEN' as const } : m)));
  }, []);

  // ── 세션 로드 ────────────────────────────────────────────────────────────
  const loadSession = useCallback(async () => {
    setPhase('loading');
    setErrorMsg(null);
    try {
      const s = await getBarSessionStore().get(slug);
      if (!s || !canChat(s.trustLevel)) {
        setSession(null);
        setPhase('needsSession');
        return;
      }
      setSession(s);
      setPhase('ready');
    } catch {
      setSession(null);
      setPhase('needsSession');
    }
  }, [slug]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // ── 전송 계층 수명주기 ────────────────────────────────────────────────────
  const onFatal = useCallback((err: ChatFatalError) => {
    transportRef.current = null;
    if (needsReauth(err.reason)) {
      setSession(null);
      setPhase('needsSession');
      setErrorMsg(err.message);
      return;
    }
    setPhase('denied');
    setErrorMsg(err.message);
  }, []);

  const connect = useCallback(async () => {
    if (!session) {
      return;
    }
    const token = await getToken();
    if (!token) {
      setPhase('denied');
      setErrorMsg('로그인이 필요해요');
      return;
    }
    transportRef.current?.stop();
    const transport = createChatTransport({
      slug,
      authToken: token,
      sessionToken: session.sessionToken,
      lastEventId: cursorRef.current,
      handlers: {
        onMessage: m => {
          cursorRef.current = Math.max(cursorRef.current ?? 0, m.id);
          upsert(m);
        },
        onHidden: e => markHidden(e.id),
        onState: (state, kind) => {
          setConnState(state);
          setConnKind(kind);
        },
        onFatal,
        onDowngrade: reason => {
          console.warn('[BarChat] SSE → 폴링 강등:', reason);
        },
      },
    });
    transportRef.current = transport;
    transport.start();
  }, [session, slug, upsert, markHidden, onFatal]);

  useEffect(() => {
    if (phase !== 'ready') {
      return;
    }
    connect();
    return () => {
      const t = transportRef.current;
      if (t) {
        cursorRef.current = t.lastEventId() ?? cursorRef.current;
        t.stop();
      }
      transportRef.current = null;
    };
  }, [phase, connect]);

  // 백그라운드에서 장기 연결을 붙들고 있을 이유가 없다. 복귀 시 Last-Event-ID 로 이어받는다.
  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (phase !== 'ready') {
        return;
      }
      if (next === 'active') {
        if (!transportRef.current) {
          connect();
        }
        return;
      }
      const t = transportRef.current;
      if (t) {
        cursorRef.current = t.lastEventId() ?? cursorRef.current;
        t.stop();
        transportRef.current = null;
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [phase, connect]);

  // 새 메시지가 오면 하단으로.
  useEffect(() => {
    if (messages.length === 0) {
      return;
    }
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, [messages.length]);

  // ── 액션 ────────────────────────────────────────────────────────────────
  const send = async () => {
    const content = input.trim();
    if (!content || sending || !session) {
      return;
    }
    setSending(true);
    try {
      const res = await instance.post(
        `/api/v2/bars/${encodeURIComponent(slug)}/chat/messages`,
        { content },
        { headers: { [SESSION_HEADER]: session.sessionToken } },
      );
      setInput('');
      // 서버가 돌려준 내 메시지는 isMine:true 다. SSE 브로드캐스트본(isMine:false)보다
      // 먼저 넣어두면 내 말풍선이 즉시 오른쪽에 뜬다. 같은 id 라 중복되지 않는다.
      const mine = res.data?.data as ChatMessage | undefined;
      if (mine && typeof mine.id === 'number') {
        upsert({ ...mine, isMine: true });
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string } } };
      Alert.alert('전송 실패', err.response?.data?.msg ?? '메시지를 보내지 못했어요');
    } finally {
      setSending(false);
    }
  };

  const block = useCallback(
    async (item: ChatMessage) => {
      if (!session) {
        return;
      }
      try {
        await instance.post(
          `/api/v2/bars/${encodeURIComponent(slug)}/chat/identities/${item.authorRef}/block`,
          {},
          { headers: { [SESSION_HEADER]: session.sessionToken } },
        );
        // 서버도 이후 응답에서 걸러주지만, 화면은 즉시 반응해야 한다.
        setBlocked(prev => new Set(prev).add(item.authorRef));
      } catch (e: unknown) {
        const err = e as { response?: { data?: { msg?: string } } };
        Alert.alert('오류', err.response?.data?.msg ?? '차단하지 못했어요');
      }
    },
    [session, slug],
  );

  const onLongPress = (item: ChatMessage) => {
    if (item.isMine || item.status === 'HIDDEN') {
      return;
    }
    Alert.alert(item.nickname, '이 사용자에 대해 어떻게 할까요?', [
      { text: '신고하기', onPress: () => setReportTarget(item) },
      { text: '차단하기', style: 'destructive', onPress: () => { block(item); } },
      { text: '취소', style: 'cancel' },
    ]);
  };

  const report = async (reason: string) => {
    const target = reportTarget;
    setReportTarget(null);
    if (!target || !session) {
      return;
    }
    try {
      await instance.post(
        `/api/v2/bars/${encodeURIComponent(slug)}/chat/messages/${target.id}/report`,
        { reason, detail: '' },
        { headers: { [SESSION_HEADER]: session.sessionToken } },
      );
      Alert.alert('신고 접수', '신고가 접수됐어요. 여러 명이 신고하면 자동으로 가려집니다.');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string } } };
      Alert.alert('오류', err.response?.data?.msg ?? '신고하지 못했어요');
    }
  };

  // ── 렌더 ────────────────────────────────────────────────────────────────
  const visible = useMemo(() => messages.filter(m => !blocked.has(m.authorRef)), [messages, blocked]);
  const badge = badgeOf(connState, connKind);

  const renderItem = ({ item }: { item: ChatMessage }) => {
    if (item.status === 'HIDDEN') {
      return (
        <View style={styles.hiddenRow}>
          <Text style={styles.hiddenText}>신고가 누적되어 가려진 메시지입니다</Text>
        </View>
      );
    }
    const mine = item.isMine;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onLongPress={() => onLongPress(item)}
        delayLongPress={350}
        style={[styles.messageRow, mine ? styles.rowMine : styles.rowOther]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
          {!mine && (
            <Text style={styles.nickname} numberOfLines={1}>
              {item.nickname}
            </Text>
          )}
          <Text style={[styles.content, mine && styles.contentMine]}>{item.content}</Text>
          <Text style={[styles.time, mine && styles.timeMine]}>{formatTime(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {barName}
          </Text>
          <Text style={styles.headerSub}>익명 채팅 · 7일 후 삭제</Text>
        </View>
        {phase === 'ready' && (
          <View style={styles.badge}>
            <View style={[styles.dot, { backgroundColor: badge.color }]} />
            <Text style={styles.badgeText}>{badge.text}</Text>
          </View>
        )}
      </View>

      {phase === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.hintText}>세션 확인 중…</Text>
        </View>
      )}

      {phase === 'needsSession' && (
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {errorMsg ?? '매장 인증이 필요해요.\n가게 근처에서 인증하면 채팅에 참여할 수 있어요.'}
          </Text>
          {!isBarSessionStoreReady() && (
            <Text style={styles.devText}>(개발: BarSessionStore 미등록 — T-22 대기)</Text>
          )}
          <TouchableOpacity style={styles.retryBtn} onPress={() => { loadSession(); }}>
            <Text style={styles.retryText}>다시 확인</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'denied' && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{errorMsg ?? '채팅에 입장할 수 없어요'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { loadSession(); }}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'ready' && (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={insets.top + 8}>
          <FlatList
            ref={listRef}
            data={visible}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>아직 메시지가 없어요. 첫 인사를 남겨보세요 :)</Text>
              </View>
            }
          />
          <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder={session ? `${session.nickname} (으)로 참여 중` : '메시지를 입력하세요'}
              placeholderTextColor="#666"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
              onPress={() => { send(); }}
              disabled={!input.trim() || sending}>
              <Text style={styles.sendText}>전송</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      <Modal
        visible={reportTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setReportTarget(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>신고 사유</Text>
            {REPORT_REASONS.map(r => (
              <TouchableOpacity key={r.key} style={styles.reasonRow} onPress={() => { report(r.key); }}>
                <Text style={styles.reasonText}>{r.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelRow} onPress={() => setReportTarget(null)}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#222',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#fff', fontSize: 20 },
  headerCenter: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },
  headerSub: { color: '#666', fontSize: 11, marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#141414',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2a2a2a',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { color: '#aaa', fontSize: 11 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  hintText: { color: '#888', fontSize: 13, marginTop: 12 },
  errorText: { color: '#ddd', fontSize: 14, textAlign: 'center', lineHeight: 21 },
  devText: { color: '#5a5a5a', fontSize: 11, marginTop: 10 },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  listContent: { padding: 12, paddingBottom: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { color: '#666', fontSize: 13 },
  messageRow: { marginBottom: 10, flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '78%', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  bubbleOther: {
    backgroundColor: '#1a1a1a',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#262626',
    borderTopLeftRadius: 4,
  },
  bubbleMine: { backgroundColor: '#fff', borderTopRightRadius: 4 },
  nickname: { color: '#9a9a9a', fontSize: 11, fontWeight: '600', marginBottom: 3 },
  content: { color: '#eee', fontSize: 14, lineHeight: 20 },
  contentMine: { color: '#000' },
  time: { color: '#555', fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  timeMine: { color: '#888' },
  hiddenRow: { marginBottom: 10, alignItems: 'center' },
  hiddenText: {
    color: '#555',
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#0f0f0f',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#222',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: '#111',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#262626',
  },
  sendBtn: {
    paddingHorizontal: 16,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  sendBtnDisabled: { backgroundColor: '#333' },
  sendText: { color: '#000', fontSize: 14, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#141414',
    borderRadius: 14,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2a2a2a',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  reasonRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#242424',
  },
  reasonText: { color: '#ddd', fontSize: 15 },
  cancelRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#242424',
  },
  cancelText: { color: '#888', fontSize: 15, textAlign: 'center' },
});

export default BarChatScreen;
