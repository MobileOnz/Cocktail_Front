// App.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from 'react-native-splash-screen';
import Navigation from './src/Navigation/Navigation';
import {Provider as PaperProvider} from 'react-native-paper';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';
import { setGlobalInsets } from './src/assets/contexts/globalInsets';
// import MobileAds from "react-native-google-mobile-ads";
// import { firebase } from "@react-native-firebase/app";

import { ToastProvider } from './src/Components/ToastContext';

import RNBootSplash from 'react-native-bootsplash';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import NaverLogin from '@react-native-seoul/naver-login';

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

  const [isFirstLaunch, setIsFirstLaunch] = useState<null | boolean>(null);
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
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('onboardingDone');
        setIsFirstLaunch(value === null);
      } catch (error) {
        console.error('AsyncStorage error: ', error);
      }
    };

    checkOnboarding();

    // SplashScreen 숨기기
    setTimeout(() => {
      if (Platform.OS === 'ios') {
        RNBootSplash.hide();  // iOS에서는 bootsplash 사용
      } else {
        SplashScreen.hide();  // Android에서는 splash-screen 사용
      }
    }, 3000);
  }, []);

  if (isFirstLaunch === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (

    <PaperProvider>
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  </PaperProvider>

    );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
