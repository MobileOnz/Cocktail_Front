// Navigation.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../Screens/OnboardingScreen';
import LoginScreen from '../Screens/Login';
import Maps from '../BottomTab/Maps';
import SearchScreen from '../Screens/SearchScreen';
import BottomTabNavigator from './BottomTabNavigator';
import RecommendationFlowScreen from '../Screens/RecommendationFlowScreen';
import LoadingScreen from '../Screens/LoadingScreen';
import ResultScreen from '../Screens/ResultScreen';
import SignupScreen from '../Screens/SignupScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import TermsAndConditionsScreen from '../Screens/TermsAndConditionsScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Maps: undefined;
  SearchScreen: {initialKeyword?: string};
  BottomTabNavigator: {
    screen?: string;
    params?: {
      shouldRefresh?: boolean;
    };
  };
  RecommendationFlow: undefined;
  LoadingScreen: undefined;
  ResultScreen: undefined;
  ProfileScreen: undefined;
  SignupScreen: {code? : string};
  TermsAndConditionsScreen : undefined
};

const Stack = createStackNavigator<RootStackParamList>();

const Navigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="TermsAndConditionsScreen" component={TermsAndConditionsScreen}/>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} />
        <Stack.Screen name="Maps" component={Maps} />
        <Stack.Screen name="BottomTabNavigator" component={BottomTabNavigator} />
        <Stack.Screen name="RecommendationFlow" component={RecommendationFlowScreen} />
        <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
        <Stack.Screen name="ResultScreen" component={ResultScreen} />
       
        <Stack.Screen name="SignupScreen" component={SignupScreen}/>
        <Stack.Screen name="ProfileScreen" component={ProfileScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
