// App.tsx
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashScreen from "react-native-splash-screen";
import Navigation from "./src/Navigation/Navigation";

import {Provider as PaperProvider} from "react-native-paper"
import { GestureHandlerRootView } from "react-native-gesture-handler";

// import MobileAds from "react-native-google-mobile-ads";
import { firebase } from "@react-native-firebase/app";

import { ToastProvider } from "./src/Components/ToastContext";

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === "dark";
  const [isFirstLaunch, setIsFirstLaunch] = useState<null | boolean>(null);

  // useEffect(() => {
    
  //   if (!firebase.apps.length) {
  //     console.log("🔥 Firebase 자동 초기화 완료");
  //   }

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
      SplashScreen.hide();
    }, 2000);
  }, []);

  if (isFirstLaunch === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ToastProvider>
      <Navigation />
    </ToastProvider>
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
