// QrScanScreen.tsx (T-22)
//
// QR 스캔 → GPS 수집 → POST /visit-session → 신뢰등급(L1/L2) 획득 → BarMenuScreen 으로 복귀.
//
// 설계 메모 (백엔드 T-11 문서 §1):
//   QR 은 "이 사람이 저 매장의 플래카드를 봤다"는 **의도**만 증명한다. 비밀값이 아니다.
//   "지금 매장 안에 있다"는 **GPS만이 증명**한다. 그래서 둘 다 보낸다.
//   QR 이 없어도 반경 안이면 L1(채팅)은 나온다. QR 은 L2(가격)에만 필요하다.
//
// ⚠️ react-native-vision-camera 가 아직 package.json 에 없다.
//    정적 import 하면 타입체크와 번들이 깨지므로 지연 로드하고,
//    없으면 "수동 입력" 폴백으로 동작한다. 설치되면 자동으로 카메라 경로를 탄다.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  PermissionsAndroid,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import DeviceInfo from 'react-native-device-info';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import { colors, fonts, fontSize, radius, spacing } from '../../lib/theme';
import { toUserMessage } from '../../lib/api';
import { RootStackParamList } from '../../Navigation/Navigation';
import ErrorState from '../../Components/common/ErrorState';
import { detectMockLocation } from '../../native/MockLocationDetector';
import {
  createSession,
  VisitDeniedError,
  type Coords,
} from '../../services/BarSessionStore';

// ── vision-camera 지연 로드 ───────────────────────────────────────────────
type VisionCameraModule = {
  Camera: React.ComponentType<any>;
  useCameraDevice: (position: 'back' | 'front') => any;
  useCodeScanner: (opts: any) => any;
};

// react-native-vision-camera 로드. 설치돼 있으면 카메라 경로, 없거나 네이티브 링크가
// 빠지면(예: pod install 누락) require 가 throw 하므로 잡아서 수동 입력 폴백으로 떨어진다.
// 크래시 없이 항상 화면은 뜬다.
function loadVisionCamera(): VisionCameraModule | null {
  try {
    const mod = require('react-native-vision-camera');
    // 네이티브가 링크됐는지 최소 확인. Camera 컴포넌트가 없으면 폴백.
    return mod?.Camera ? (mod as VisionCameraModule) : null;
  } catch {
    return null;
  }
}

const VisionCamera = loadVisionCamera();
const hasCamera = VisionCamera != null; // false → 수동 입력 폴백

// ── 위치 ──────────────────────────────────────────────────────────────────
async function ensureLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  const result = await Geolocation.requestAuthorization('whenInUse');
  return result === 'granted';
}

async function ensureCameraPermission(): Promise<boolean> {
  if (!hasCamera) { return false; }
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  const status = await (VisionCamera as any).Camera.requestCameraPermission();
  return status === 'granted';
}

/** accuracy 를 함께 받는다. 서버는 accuracyM > 100 이면 L2 를 주지 않는다. */
function getCurrentPosition(): Promise<{ lat: number; lng: number; accuracyM: number }> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyM: pos.coords.accuracy ?? 9999,
        }),
      err => reject(err),
      // L2 를 노리므로 고정밀. 배터리보다 정확도가 중요하다.
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

// ── 개발 전용 위치 보정 ────────────────────────────────────────────────────
// iOS 시뮬레이터의 CoreLocation 은 simctl 로 설정한 좌표에 신뢰할 정확도를 주지 않아
// accuracyM 이 늘 100m 를 초과 → 서버가 L2 를 강등한다(항상 L1). 그러면 시뮬레이터에서
// 가격보기(L2)를 아예 체험할 수 없다.
// 그래서 __DEV__ 이고 시뮬레이터일 때만 accuracyM 을 서버가 L2 를 인정하는 값으로 낮춘다.
// 좌표(lat/lng)는 손대지 않는다 — 테스터가 simctl 로 바 근처로 세팅한 실제 값을 그대로 쓰므로
// 반경 검증은 정상 작동하고, "정확도만" 시뮬레이터 한계를 메운다.
// ⚠️ 프로덕션(__DEV__ === false)에서는 이 함수가 입력을 그대로 반환한다. 보안 게이트 무변경.
const DEV_SIM_ACCURACY_M = 20; // 서버 L2 임계값(≤100) 이내
const isDevSimulator = __DEV__ && DeviceInfo.isEmulatorSync();

function applyDevLocationOverride(
  pos: { lat: number; lng: number; accuracyM: number },
): { lat: number; lng: number; accuracyM: number } {
  if (!isDevSimulator) { return pos; }
  // 시뮬레이터 CoreLocation 은 accuracy 를 100m 초과로 주거나 -1(무효)로 주기도 한다.
  // 어느 쪽이든 서버가 L2 를 거부하므로, dev-시뮬레이터에서는 무조건 유효 값으로 스냅한다.
  return { ...pos, accuracyM: DEV_SIM_ACCURACY_M };
}

type Phase = 'permission' | 'scanning' | 'submitting' | 'denied' | 'error';

const QrScanScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'QrScanScreen'>>();
  const { slug, barName } = route.params;

  const [phase, setPhase] = useState<Phase>('permission');
  const [message, setMessage] = useState<string>('');
  const [manualPayload, setManualPayload] = useState('');
  const [cameraGranted, setCameraGranted] = useState(false);

  // 코드가 연속으로 여러 번 들어오므로 1회만 처리한다.
  const handled = useRef(false);
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  const bootstrap = useCallback(async () => {
    setPhase('permission');
    setMessage('');
    handled.current = false;

    const locOk = await ensureLocationPermission();
    if (!mounted.current) { return; }
    if (!locOk) {
      setMessage('매장 인증에는 위치 권한이 필요해요. 설정에서 허용해주세요.');
      setPhase('error');
      return;
    }

    if (hasCamera) {
      const camOk = await ensureCameraPermission();
      if (!mounted.current) { return; }
      setCameraGranted(camOk);
      if (!camOk) {
        setMessage('QR을 찍으려면 카메라 권한이 필요해요. 아래에 코드를 직접 입력할 수도 있어요.');
      }
    }
    setPhase('scanning');
  }, []);

  useEffect(() => { bootstrap(); }, [bootstrap]);

  /** QR 페이로드로 세션을 만든다. payload 가 없으면 GPS만으로 L1 시도. */
  const submit = useCallback(
    async (qrPayload?: string) => {
      if (handled.current) { return; }
      handled.current = true;
      setPhase('submitting');

      try {
        const pos = applyDevLocationOverride(await getCurrentPosition());
        const mockLocationDetected = await detectMockLocation();
        const coords: Coords = { ...pos, mockLocationDetected };

        const session = await createSession(slug, coords, qrPayload);
        if (!mounted.current) { return; }

        // L2 를 노렸는데 L1 이 나온 경우(모의 위치 의심 / accuracy 미달)를 사용자에게 알린다.
        if (qrPayload && session.trustLevel !== 'L2') {
          navigation.replace('BarMenuScreen', {
            slug,
            barName,
            notice: '위치 정확도가 낮아 가격은 아직 볼 수 없어요. 매장 안에서 다시 시도해주세요.',
          });
          return;
        }
        navigation.replace('BarMenuScreen', { slug, barName });
      } catch (e) {
        if (!mounted.current) { return; }
        handled.current = false;

        if (e instanceof VisitDeniedError) {
          setMessage(e.message);
          setPhase('denied');
          return;
        }
        setMessage(toUserMessage(e, '매장 인증에 실패했어요.'));
        setPhase('error');
      }
    },
    [slug, barName, navigation],
  );

  // vision-camera 스캐너. 훅은 조건부 호출이 불가하므로 모듈이 있을 때만 쓰는 하위 컴포넌트로 분리한다.
  const CameraView = useCallback(() => {
    if (!VisionCamera || !cameraGranted) { return null; }
    const { Camera, useCameraDevice, useCodeScanner } = VisionCamera;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const device = useCameraDevice('back');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const codeScanner = useCodeScanner({
      codeTypes: ['qr'],
      onCodeScanned: (codes: Array<{ value?: string }>) => {
        const value = codes?.[0]?.value;
        if (value) { submit(extractPayload(value)); }
      },
    });
    if (!device) { return null; }
    return (
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={phase === 'scanning'}
        codeScanner={codeScanner}
      />
    );
  }, [cameraGranted, phase, submit]);

  const renderBody = () => {
    if (phase === 'permission' || phase === 'submitting') {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.textInverse} />
          <Text style={styles.centerText}>
            {phase === 'submitting' ? '매장을 확인하는 중…' : '권한을 확인하는 중…'}
          </Text>
        </View>
      );
    }

    if (phase === 'denied' || phase === 'error') {
      return (
        <ErrorState
          message={message}
          onRetry={bootstrap}
          retryLabel="다시 시도"
          tone="dark"
        />
      );
    }

    // scanning
    return (
      <View style={styles.scanArea}>
        <CameraView />
        <View style={styles.reticle} pointerEvents="none" />
        <Text style={styles.hint}>
          {hasCamera && cameraGranted
            ? '테이블 위 ONZ QR을 사각형 안에 맞춰주세요'
            : '카메라를 쓸 수 없어요. QR 아래 코드를 직접 입력해주세요.'}
        </Text>

        {/* 개발 편의 안내 — 시뮬레이터엔 카메라·정밀 GPS 가 없다. __DEV__ 에서만 노출. */}
        {isDevSimulator && (
          <Text style={styles.devHint}>
            [DEV] 시뮬레이터: 카메라 대신 아래에 qrPayload 를 붙여넣거나{'\n'}
            딥링크(onzcocktail://v/{slug})로 진입하세요. 정확도는 자동 보정됩니다.
          </Text>
        )}

        {/* 수동 입력 폴백 — 카메라 미설치/권한 거부/훼손된 QR 대응 */}
        <View style={styles.manualBox}>
          <TextInput
            style={styles.manualInput}
            value={manualPayload}
            onChangeText={setManualPayload}
            placeholder="QR 코드 값 입력"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="QR 코드 직접 입력"
          />
          <TouchableOpacity
            style={[styles.manualButton, !manualPayload.trim() && styles.manualButtonDisabled]}
            disabled={!manualPayload.trim()}
            onPress={() => submit(extractPayload(manualPayload.trim()))}
            accessibilityRole="button"
            accessibilityLabel="입력한 코드로 인증"
          >
            <Text style={styles.manualButtonText}>확인</Text>
          </TouchableOpacity>
        </View>

        {/* QR 없이도 반경 안이면 L1(채팅)은 받을 수 있다. */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => submit(undefined)}
          accessibilityRole="button"
          accessibilityLabel="QR 없이 위치만으로 인증"
        >
          <Text style={styles.skipText}>QR 없이 위치만으로 입장</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + heightPercentage(spacing.sm) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="닫기"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{barName ?? '매장 인증'}</Text>
        <View style={styles.headerSpacer} />
      </View>
      {/* 수동 입력 시 소프트키보드가 '확인' 버튼을 가리지 않도록 본문을 밀어 올린다. */}
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + heightPercentage(spacing.sm)}
      >
        {renderBody()}
      </KeyboardAvoidingView>
    </View>
  );
};

/**
 * QR 에는 유니버설 링크(https://onz-cocktail.kr/v/{slug}?k=&s=)가 인코딩될 수도,
 * 원시 페이로드({slug}.{keyVersion}.{sig})가 그대로 들어 있을 수도 있다.
 * 서버가 기대하는 것은 원시 페이로드다.
 */
export function extractPayload(scanned: string): string {
  const value = scanned.trim();
  if (!value.startsWith('http')) { return value; }
  try {
    // URL 은 RN Hermes 에 있다. 실패하면 원문 그대로 보낸다(서버가 INVALID_QR 로 거부).
    const url = new URL(value);
    const slug = url.pathname.split('/').filter(Boolean).pop();
    const k = url.searchParams.get('k');
    const s = url.searchParams.get('s');
    if (slug && k && s) { return `${slug}.${k}.${s}`; }
    return value;
  } catch {
    return value;
  }
}

export default QrScanScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: widthPercentage(spacing.lg),
    paddingBottom: heightPercentage(spacing.md),
  },
  close: { fontFamily: fonts.regular, fontSize: fontPercentage(22), color: colors.textInverse },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.lg),
    color: colors.textInverse,
  },
  headerSpacer: { width: widthPercentage(spacing.xl) },

  body: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerText: {
    marginTop: heightPercentage(spacing.md),
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.base),
    color: colors.textTertiary,
  },

  scanArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  reticle: {
    width: widthPercentage(240),
    height: widthPercentage(240),
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.textInverse,
  },
  hint: {
    marginTop: heightPercentage(spacing.xl),
    paddingHorizontal: widthPercentage(spacing.xl),
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.textTertiary,
  },
  devHint: {
    marginTop: heightPercentage(spacing.md),
    paddingHorizontal: widthPercentage(spacing.xl),
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.xs),
    lineHeight: fontPercentage(16),
    color: colors.accent,
  },

  manualBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: heightPercentage(spacing.xxl),
    paddingHorizontal: widthPercentage(spacing.xl),
    width: '100%',
  },
  manualInput: {
    flex: 1,
    height: heightPercentage(44),
    paddingHorizontal: widthPercentage(spacing.md),
    borderRadius: radius.sm,
    backgroundColor: '#1a1a1a',
    color: colors.textInverse,
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.sm),
  },
  manualButton: {
    marginLeft: widthPercentage(spacing.sm),
    paddingHorizontal: widthPercentage(spacing.lg),
    height: heightPercentage(44),
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualButtonDisabled: { opacity: 0.4 },
  manualButtonText: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.text,
  },

  skipButton: { marginTop: heightPercentage(spacing.xl), padding: widthPercentage(spacing.md) },
  skipText: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
