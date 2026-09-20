import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import WebView from 'react-native-webview';
import { RECOMMENDATION_WEB_URL } from '@env';
import type { RootStackParamList } from '../Navigation/Navigation';

type Props = StackScreenProps<RootStackParamList, 'RecommendationScreen'>;
const webUrl = RECOMMENDATION_WEB_URL || (__DEV__
  ? Platform.select({ android: 'http://10.0.2.2:5173', default: 'http://localhost:5173' })
  : '');

export default function RecommendationWebScreen({ navigation }: Props) {
  const webview = useRef<WebView>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [revision, setRevision] = useState(0);
  const close = useCallback(() => navigation.goBack(), [navigation]);

  useFocusEffect(useCallback(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!ready || failed || !webUrl) {
        close();
      } else {
        webview.current?.injectJavaScript("window.dispatchEvent(new Event('onz:native-back')); true;");
      }
      return true;
    });
    return () => listener.remove();
  }, [close, failed, ready]));

  return (
    <SafeAreaView style={styles.container}>
      {failed || !webUrl ? (
        <View style={styles.message}>
          <Text style={styles.title}>추천 화면에 연결할 수 없어요</Text>
          <Text style={styles.description}>잠시 후 다시 시도해주세요.</Text>
          {!!webUrl && <TouchableOpacity accessibilityRole="button" style={styles.button} onPress={() => {
            setFailed(false); setReady(false); setRevision(value => value + 1);
          }}><Text style={styles.buttonText}>다시 시도</Text></TouchableOpacity>}
          <TouchableOpacity accessibilityRole="button" onPress={close}><Text style={styles.description}>돌아가기</Text></TouchableOpacity>
        </View>
      ) : (
        <WebView
          key={revision}
          ref={webview}
          source={{ uri: webUrl }}
          style={styles.container}
          originWhitelist={[webUrl.replace(/\/$/, '')]}
          onShouldStartLoadWithRequest={request => request.url === 'about:blank' || request.url === webUrl || request.url.startsWith(webUrl.replace(/\/$/, '') + '/')}
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          startInLoadingState
          renderLoading={() => <View style={styles.loading}><ActivityIndicator color="#798b55" accessibilityLabel="추천 화면 불러오는 중" /></View>}
          onLoadStart={() => setReady(false)}
          onLoadEnd={() => setReady(true)}
          onError={() => setFailed(true)}
          onHttpError={() => setFailed(true)}
          onContentProcessDidTerminate={() => setFailed(true)}
          onRenderProcessGone={() => setFailed(true)}
          onMessage={event => {
            if (event.nativeEvent.data === 'onz:close') { close(); }
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f6f2' },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7f6f2' },
  message: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#25291f', fontSize: 20 },
  description: { color: '#727a67', marginVertical: 20 },
  button: { backgroundColor: '#34452b', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 8 },
  buttonText: { color: '#fff' },
});
