// App.tsx
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashScreen from "react-native-splash-screen";
import Navigation from "./src/Navigation/Navigation";
import {Provider as PaperProvider} from "react-native-paper"
import { useSafeAreaInsets, SafeAreaProvider } from "react-native-safe-area-context";
import { setGlobalInsets } from "./src/assets/contexts/globalInsets"; 
// import MobileAds from "react-native-google-mobile-ads";
// import { firebase } from "@react-native-firebase/app";

import { ToastProvider } from "./src/Components/ToastContext";

import RNBootSplash from "react-native-bootsplash";

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

  // useEffect(() => {

  //   MobileAds()
  //     .initialize()
  //     .then(() => {
  //       console.log("AdMob 초기화 완료");
  //     });
  // }, []);
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem("onboardingDone");
        setIsFirstLaunch(value === null);
      } catch (error) {
        console.error("AsyncStorage error: ", error);
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
    justifyContent: "center",
    alignItems: "center",
  },
});

export default App;