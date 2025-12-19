// App.tsx
import React, { useEffect } from 'react';

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
import { syncKeywordData } from './src/model/local/service/keywordService';
import { Platform } from 'react-native';


function AppContent() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setGlobalInsets(insets);
  }, [insets]);

  return (
    <ToastProvider>
      <Navigation />
    </ToastProvider>
  );
}

function App(): React.JSX.Element {



  // useEffect(() => {

  //   MobileAds()
  //     .initialize()
  //     .then(() => {
  //       console.log("AdMob 초기화 완료");
  //     });
  // }, []);
  useEffect(() => {
    initAmplitude();

    const bootstrapLocalData = async () => {
      try {
        await initDb();                 // 테이블/마이그레이션
        const keywords = await syncKeywordData();    // SQLite 저장
        console.log('[Keyword first item]', keywords?.[0]);
      } catch (error) {
        console.error('bootstrap error: ', error);
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

    <PaperProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </PaperProvider>

  );
}


export default App;
