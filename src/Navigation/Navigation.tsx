// Navigation.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../Screens/Login';
import Maps from '../BottomTab/Cocktail_List/CocktailListScreen';
import SearchScreen from '../Screens/Search/SearchScreen';
import BottomTabNavigator from './BottomTabNavigator';
import RecommendationFlowScreen from '../Screens/RecommendationFlowScreen';
import LoadingScreen from '../Screens/LoadingScreen';
import ResultScreen from '../Screens/ResultScreen';
import SignupScreen from '../Screens/SignupScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import TermsAndConditionsScreen from '../Screens/TermsAndConditionsScreen';
import { CocktailDetailScreen } from '../Components/CocktailDetail/CocktailDetailScreen';
import CocktailBoxScreen from '../Screens/CocktailBox/CocktailBoxScreen';

export type BottomTabParamList = {
  지도: undefined;
  '칵테일 백과': undefined;
  '맞춤 추천': undefined;
  마이페이지: undefined;
};
export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Maps: undefined;
  SearchScreen: { initialKeyword?: string };
  BottomTabNavigator: {
    screen?: string;
    params?: {
      shouldRefresh?: boolean;
    };
  };
  RecommendationFlow: undefined;
  LoadingScreen: {
    alcholType: number;
    tasteCategoryId: number;
    tasteDetailId: number;
    nickname: string;
  };
  ResultScreen: {
    cocktailImage: any;
    nickname: string;
    cocktailName: string;
    cocktailDescription: string;
  };
  ProfileScreen: undefined;
  RecommendationIntro: undefined;
  SignupScreen: { code?: string };
  TermsAndConditionsScreen: undefined
  CocktailDetailScreen: { cocktailId: number }
  TermsAndConditionsScreen: undefined;

  CocktailBoxScreen: undefined

};

const Stack = createStackNavigator<RootStackParamList>();

const Navigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="BottomTabNavigator"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="TermsAndConditionsScreen" component={TermsAndConditionsScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} />
        <Stack.Screen name="Maps" component={Maps} />
        <Stack.Screen name="BottomTabNavigator" component={BottomTabNavigator} />
        <Stack.Screen name="RecommendationFlow" component={RecommendationFlowScreen} />
        <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
        <Stack.Screen name="ResultScreen" component={ResultScreen} />
        <Stack.Screen name="CocktailDetailScreen" component={CocktailDetailScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name='CocktailBoxScreen' component={CocktailBoxScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
