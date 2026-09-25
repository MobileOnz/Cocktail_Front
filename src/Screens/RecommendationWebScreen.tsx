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
  BackHandler,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {HeaderBackButton} from '@react-navigation/elements';
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
  const [failed, setFailed] = useState(false);
  const [revision, setRevision] = useState(0);
  const close = useCallback(() => navigation.goBack(), [navigation]);

  /**
   * 뒤로가기는 웹뷰를 거쳐야 한다.
   *
   * 설문은 웹앱 안에서 6단계로 진행되는데, 그 단계를 아는 건 웹앱뿐이다.
   * 네이티브가 바로 화면을 닫아버리면 "한 문항 앞으로" 가 불가능해지고,
   * 1번을 잘못 고른 사람은 6문항을 처음부터 다시 해야 한다.
   *
   * 그래서 뒤로가기 신호를 웹앱에 넘기고(onz:native-back), 더 돌아갈 곳이
   * 없을 때 웹앱이 돌려주는 onz:close 를 받아 그때 화면을 닫는다.
   * 웹앱은 이 이벤트를 이미 듣고 있다 — 예전 구현에 있던 이 다리가
   * 웹뷰 리라이트 때 사라지면서 계약의 한쪽 끝만 남아 있었다.
   *
   * 아직 로드되지 않았거나 실패한 상태에서는 웹앱이 답할 수 없으므로 바로 닫는다.
   * 안 그러면 로딩 중에 갇힌다.
   */
  const requestBack = useCallback(() => {
    if (!ready || failed) {
      close();
      return;
    }
    webView.current?.injectJavaScript(
      "window.dispatchEvent(new Event('onz:native-back')); true;",
    );
  }, [close, failed, ready]);

  // 안드로이드 하드웨어 백. 리라이트 때 빠져서 설문 도중에 눌러도 화면이 통째로 닫혔다.
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      requestBack();
      return true;
    });
    return () => sub.remove();
  }, [requestBack]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {backgroundColor: night.ink},
      headerTintColor: night.text,
      headerTitleStyle: {fontFamily: fonts.semibold, fontSize: 17},
      headerShadowVisible: false,
      headerBackTitle: '뒤로',
      title: '맞춤 추천',
      // 기본 뒤로가기는 화면을 바로 pop 한다. iOS 에는 하드웨어 백이 없어
      // 이 버튼이 유일한 길이므로, 여기서도 웹앱을 거치게 바꾼다.
      headerLeft: props => (
        <HeaderBackButton
          {...props}
          label="뒤로"
          tintColor={night.text}
          onPress={requestBack}
        />
      ),
    });
  }, [navigation, requestBack]);

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
