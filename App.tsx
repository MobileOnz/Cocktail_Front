// App.tsx
import React, {memo, useEffect, useState} from 'react';

import SplashScreen from 'react-native-splash-screen';
import Navigation from './src/Navigation/Navigation';
import {Provider as PaperProvider} from 'react-native-paper';
import {
  useSafeAreaInsets,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import {setGlobalInsets} from './src/assets/contexts/globalInsets';
// import MobileAds from "react-native-google-mobile-ads";
// import { firebase } from "@react-native-firebase/app";
import {initAmplitude} from './src/analytics/amplitudeInit';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {queryClient, persister} from './src/lib/queryClient';
import {ToastProvider} from './src/Components/ToastContext';
import ErrorBoundary from './src/Components/common/ErrorBoundary';
import {initDb} from './src/model/local/index';
import RNBootSplash from 'react-native-bootsplash';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import NaverLogin from '@react-native-seoul/naver-login';
import {syncKeywordData} from './src/model/local/service/keywordService';
import {Platform} from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getUniqueId } from 'react-native-device-info';
import Toast from 'react-native-toast-message';
import {getUniqueId} from 'react-native-device-info';
import {MonitoringRepository} from './src/model/repository/MonitoringRepository';
import * as Sentry from '@sentry/react-native';
import {SENTRY_ENV} from '@env';
import {syncSentryUser} from './src/tokenRequest/Token';
// Navigation.tsx 의 NavigationContainer 가 onReady 에서 이 인테그레이션을 등록한다.
// 이게 있어야 에러/트랜잭션에 화면 이름과 라우트 전환 브레드크럼이 붙는다.
import {sentryNavigationIntegration} from './src/lib/sentryNavigation';

Sentry.init({
  dsn: 'https://423a7e335c9656b156b74f362b0fcdb0@o4512060957917184.ingest.us.sentry.io/4512060961259520',

  // 로컬 개발에서는 이벤트·세션리플레이를 보내지 않는다(노이즈·쿼터 절약).
  enabled: !__DEV__,

  // qa / production 구분. CI 가 .env 에 넣어준다. 없으면 배포본은 production.
  environment: SENTRY_ENV || (__DEV__ ? 'development' : 'production'),

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // 퍼포먼스 트레이싱. 라우팅 계측이 화면별 트랜잭션을 만들려면 샘플레이트가 필요하다.
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
    sentryNavigationIntegration,
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const AppContent = memo(
  ({
    isOnboarded,
    setIsOnboarded,
  }: {
    isOnboarded: boolean;
    setIsOnboarded: (val: boolean) => void;
  }) => {
    const insets = useSafeAreaInsets();

    useEffect(() => {
      setGlobalInsets(insets);
    }, [insets]);

    return (
      <ToastProvider>
        <ErrorBoundary>
          <Navigation
            isOnboarded={isOnboarded}
            setIsOnboarded={setIsOnboarded}
          />
        </ErrorBoundary>
        {/* 헤더(뒤로가기/화면 제목) 아래에 앉도록 상태바 인셋만큼 내린다. 기본값은 헤더를 덮는다. */}
        <Toast topOffset={insets.top + 48} />
      </ToastProvider>
    );
  },
);

function App(): React.JSX.Element {
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  const consumerKey = 'ZGxXBBPpRH3V1SuUWME8';
  const consumerSecret = 'joOUHCi6DR';
  const appName = 'onz';
  const serviceUrlScheme = 'naverlogin';

  // useEffect(() => {

  //   MobileAds()
  //     .initialize()
  //     .then(() => {
  //       console.log("AdMob 초기화 완료");
  //     });
  // }, []);

  useEffect(() => {
    GoogleSignin.configure({
      offlineAccess: true,
      webClientId:
        '513269758316-igsea78n7g0jq292f4u22pobqr0k47fd.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
      accountName: '',
    });

    NaverLogin.initialize({
      appName,
      consumerKey,
      consumerSecret,
      serviceUrlSchemeIOS: serviceUrlScheme,
      disableNaverAppAuthIOS: true,
    });
    NaverLogin.logout;
    NaverLogin.deleteToken;
  }, []);

  useEffect(() => {
    initAmplitude();

    const bootstrapLocalData = async () => {
      try {
        // const token = await AsyncStorage.getItem('accessToken');
        const deviceId = await getUniqueId();
        console.log('Device ID:', deviceId);
        Sentry.setTag('deviceId', deviceId);
        await syncSentryUser(); // 이미 로그인된 상태면 Sentry user 를 채운다
        const monitoringRepo = new MonitoringRepository();

        const status = await monitoringRepo.checkOnboardingStatus(deviceId);
        console.log('device :', deviceId);
        console.log('[Onboarding Status]:', status);
        setIsOnboarded(status);
        await initDb(); // 테이블/마이그레이션
        const keywords = await syncKeywordData(); // SQLite 저장
        console.log('[Keyword first item]', keywords?.[0]);
      } catch (error) {
        console.error('bootstrap error: ', error);
        setIsOnboarded(false);
        // 실패해도 앱은 띄우기
      } finally {
        // 3) 모든 작업 끝난 뒤 스플래시 제거
        if (Platform.OS === 'ios') {
          RNBootSplash.hide({fade: true});
        } else {
          SplashScreen.hide();
        }
      }
    };

    bootstrapLocalData();
  }, []);

  if (isOnboarded === null) {
    return <></>;
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{persister}}>
        <BottomSheetModalProvider>
          <PaperProvider>
            <SafeAreaProvider>
              <AppContent
                isOnboarded={isOnboarded}
                setIsOnboarded={setIsOnboarded}
              />
            </SafeAreaProvider>
          </PaperProvider>
        </BottomSheetModalProvider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(App);
