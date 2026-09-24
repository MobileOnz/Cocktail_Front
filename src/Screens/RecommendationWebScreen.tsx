import React, {
  useCallback,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StackScreenProps} from '@react-navigation/stack';
import WebView from 'react-native-webview';
import {night, fonts, round} from '../lib/theme';
import {recommendationWebTheme} from './recommendationWebTheme';
import type {RootStackParamList} from '../Navigation/Navigation';

type Props = StackScreenProps<RootStackParamList, 'RecommendationScreen'>;
const webUrl = 'https://onz-homepage.vercel.app/recommend/';

export default function RecommendationWebScreen({navigation}: Props) {
  const webView = useRef<WebView>(null);
  const {fontScale} = useWindowDimensions();
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (active) {
        setReducedMotion(value);
      }
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion,
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  const themeScript = recommendationWebTheme(fontScale, reducedMotion);
  useEffect(() => {
    webView.current?.injectJavaScript(themeScript);
  }, [themeScript]);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: night.ink},
      headerTintColor: night.text,
      headerTitleStyle: {fontFamily: fonts.semibold, fontSize: 17},
      headerShadowVisible: false,
      headerBackTitle: '뒤로',
      title: '맞춤 추천',
    });
  }, [navigation]);
  const [failed, setFailed] = useState(false);
  const [revision, setRevision] = useState(0);
  const close = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={night.ink} />
      {failed ? (
        <View style={styles.message}>
          <Text style={styles.title}>추천 화면에 연결할 수 없어요</Text>
          <Text style={styles.description}>잠시 후 다시 시도해주세요.</Text>
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.button}
            onPress={() => {
              setReady(false);
              setFailed(false);
              setRevision(value => value + 1);
            }}>
            <Text style={styles.buttonText}>다시 시도</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" onPress={close}>
            <Text style={styles.description}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          ref={webView}
          key={revision}
          injectedJavaScript={themeScript}
          textZoom={100}
          source={{uri: webUrl}}
          style={styles.container}
          originWhitelist={['https://onz-homepage.vercel.app']}
          onShouldStartLoadWithRequest={request =>
            request.url === 'about:blank' ||
            request.url === webUrl ||
            request.url.startsWith(webUrl.replace(/\/$/, '') + '/')
          }
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          onError={() => setFailed(true)}
          onHttpError={() => setFailed(true)}
          onContentProcessDidTerminate={() => setFailed(true)}
          onRenderProcessGone={() => setFailed(true)}
          onMessage={event => {
            if (event.nativeEvent.data === 'onz:ready') {
              setReady(true);
            }
            if (event.nativeEvent.data === 'onz:close') {
              close();
            }
          }}
        />
      )}
      {!failed && !ready && (
        <View style={styles.loading}>
          <ActivityIndicator
            color={night.accent}
            accessibilityLabel="추천 화면 불러오는 중"
          />
          <Text style={styles.description}>취향을 고를 준비를 하고 있어요</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: night.ink},
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: night.ink,
  },
  message: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {color: night.text, fontSize: 20, fontFamily: fonts.bold},
  description: {color: night.textDim, marginVertical: 20},
  button: {
    backgroundColor: night.accent,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: round.sm,
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonText: {color: night.onAccent, fontFamily: fonts.semibold},
});
