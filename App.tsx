// App.tsx
import React, { useEffect, useState } from 'react';

import SplashScreen from 'react-native-splash-screen';
import Navigation from './src/Navigation/Navigation';
import { Provider as PaperProvider } from 'react-native-paper';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';
import { setGlobalInsets } from './src/assets/contexts/globalInsets';
// import MobileAds from "react-native-google-mobile-ads";
// import { firebase } from "@react-native-firebase/app";
import { initAmplitude } from './src/analytics/amplitudeInit';
import { ToastProvider } from './src/Components/ToastContext';
import { initDb } from './src/model/local/index';
import RNBootSplash from 'react-native-bootsplash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import NaverLogin from '@react-native-seoul/naver-login';
import { syncKeywordData } from './src/model/local/service/keywordService';
import { Platform } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getUniqueId } from 'react-native-device-info';
import Toast from 'react-native-toast-message';
import { getUniqueId } from 'react-native-device-info';
import { MonitoringRepository } from './src/model/repository/MonitoringRepository';


function AppContent({ isOnboarded }: { isOnboarded: boolean }) {
  const insets = useSafeAreaInsets();


  useEffect(() => {
    setGlobalInsets(insets);
  }, [insets]);

  return (
    <ToastProvider>
      <Navigation isOnboarded={isOnboarded} />
      <Toast />
    </ToastProvider>
  );
}

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
        '1058340377075-vt8u6qabph0f0van79eqhkt9j2f1jkbe.apps.googleusercontent.com',
      iosClientId:
        '1058340377075-an8fq49j4mg29fq9rm88qpi253dd2vts.apps.googleusercontent.com',
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
        const monitoringRepo = new MonitoringRepository();

        const status = await monitoringRepo.checkOnboardingStatus(deviceId);
        console.log('device :', deviceId);
        console.log('[Onboarding Status]:', status);
        setIsOnboarded(status);
        await initDb();                 // 테이블/마이그레이션
        const keywords = await syncKeywordData();    // SQLite 저장
        console.log('[Keyword first item]', keywords?.[0]);
      } catch (error) {
        console.error('bootstrap error: ', error);
        setIsOnboarded(false);
        // 실패해도 앱은 띄우기
      } finally {
        // 3) 모든 작업 끝난 뒤 스플래시 제거
        if (Platform.OS === 'ios') {
          RNBootSplash.hide({ fade: true });
        } else {
          SplashScreen.hide();
        }
      }
    };

    bootstrapLocalData();
  }, []);



  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <PaperProvider>
          <SafeAreaProvider>
            <AppContent isOnboarded={isOnboarded} />
          </SafeAreaProvider>
        </PaperProvider>
      </BottomSheetModalProvider>

    </GestureHandlerRootView>

  );
}


export default App;
