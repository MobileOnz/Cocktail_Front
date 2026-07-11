// src/Components/common/RemoteImage.tsx
//
// 원격 이미지 + 플레이스홀더. QA 에서 나온 I-05 / I-09 / I-12 의 공통 원인을 한 곳에서 막는다.
//
// 무엇이 문제였나:
//   레시피 그리드의 "맨해튼" 카드가 통째로 빈칸이었다. 그런데 이미지 URL 은 살아 있다
//   (S3 → HTTP 200). 즉 **깨진 이미지가 아니라 아직 도착하지 않은 이미지**였다.
//   플레이스홀더가 없으니 그 자리는 배경색 그대로였고, 흰 배경 위의 흰 글씨/아이콘까지
//   같이 사라져 카드 하나가 존재하지 않는 것처럼 보였다. 가이드 세그먼트가 수 초간
//   백지였던 것도, 바 상세 상단이 검은 빈 영역이었던 것도 전부 같은 이유다.
//
// 그래서 이 컴포넌트는 세 상태를 **항상 같은 크기로** 그린다. 레이아웃은 절대 흔들리지 않는다.
//   1) loading — 톤에 맞는 배경 + 은은한 펄스. "곧 온다"는 신호.
//   2) error / uri 없음 — 실루엣(🍸) + 이름. "여긴 원래 이거다"라는 정보.
//   3) loaded — 이미지.
//
// 상대 경로(`/uploads/bars/x.webp`)는 axios baseURL 의 origin 으로 절대화한다.
// 백엔드가 이미지를 S3 대신 EC2 `/uploads` 로 서빙하도록 옮겨가는 중이라 둘 다 들어온다.

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageResizeMode,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { API_BASE_URL } from '@env';
import instance from '../../tokenRequest/axios_interceptor';

export type RemoteImageTone = 'dark' | 'light';

interface Props {
  /** null / undefined / '' 이면 곧장 플레이스홀더. */
  uri?: string | null;
  /** 크기·radius 등. 컨테이너에 적용된다 — 세 상태 모두 이 크기를 유지한다. */
  style?: StyleProp<ViewStyle>;
  resizeMode?: ImageResizeMode;
  /** 플레이스홀더에 표시할 이름. 없으면 실루엣만. */
  label?: string;
  tone?: RemoteImageTone;
  /** 실루엣 글자 크기. 히어로처럼 큰 영역에서는 키운다. */
  glyphSize?: number;
  accessibilityLabel?: string;
}

const TONES: Record<RemoteImageTone, { bg: string; pulse: string; glyph: string; text: string }> = {
  dark: { bg: '#161616', pulse: '#242424', glyph: '#3a3a3a', text: '#6b6b6b' },
  light: { bg: '#EFEFEF', pulse: '#E2E2E2', glyph: '#C4C4C4', text: '#9A9A9A' },
};

/** 상대 경로를 baseURL origin 으로 절대화한다. 이미 절대면 그대로. */
export function absoluteImageUrl(path?: string | null): string | null {
  if (!path) {
    return null;
  }
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  const baseRaw =
    (instance.defaults?.baseURL as string | undefined) ?? API_BASE_URL ?? '';
  const origin = baseRaw.replace(/\/onz\/?$/, '').replace(/\/$/, '');
  return origin + (path.startsWith('/') ? path : `/${path}`);
}

const RemoteImage: React.FC<Props> = ({
  uri,
  style,
  resizeMode = 'cover',
  label,
  tone = 'light',
  glyphSize = 34,
  accessibilityLabel,
}) => {
  const resolved = absoluteImageUrl(uri);
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>(
    resolved ? 'loading' : 'failed',
  );
  const palette = TONES[tone];

  // uri 가 바뀌면(리스트 재사용) 상태를 되돌린다. 안 그러면 이전 카드의 결과가 남는다.
  useEffect(() => {
    setState(resolved ? 'loading' : 'failed');
  }, [resolved]);

  const pulse = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    if (state !== 'loading') {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [state, pulse]);

  return (
    <View
      style={[styles.container, { backgroundColor: palette.bg }, style]}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {/* 배경은 언제나 깔려 있다. 이미지가 늦게 와도 이 영역은 사라지지 않는다. */}
      {state === 'loading' && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: palette.pulse, opacity: pulse },
          ]}
        />
      )}

      {state === 'failed' && (
        <View style={styles.placeholder} pointerEvents="none">
          <Text style={[styles.glyph, { fontSize: glyphSize, color: palette.glyph }]}>🍸</Text>
          {!!label && (
            <Text style={[styles.label, { color: palette.text }]} numberOfLines={2}>
              {label}
            </Text>
          )}
        </View>
      )}

      {!!resolved && state !== 'failed' && (
        <Image
          source={{ uri: resolved }}
          style={StyleSheet.absoluteFill}
          resizeMode={resizeMode}
          onLoad={() => setState('loaded')}
          onError={() => setState('failed')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  glyph: { opacity: 0.9 },
  label: { fontSize: 12, marginTop: 6, textAlign: 'center' },
});

export default RemoteImage;
