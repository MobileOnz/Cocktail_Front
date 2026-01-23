// Navigation.tsx
import React, { memo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../Screens/Login/Login';
import Home from '../BottomTab/Cocktail_List/CocktailListScreen';
import SearchScreen from '../Screens/Search/SearchScreen';
import BottomTabNavigator from './BottomTabNavigator';
import LoadingScreen from '../Screens/LoadingScreen';
import ResultScreen from '../Screens/ResultScreen';
import SignupScreen from '../Screens/Login/SignupScreen';
import ProfileScreen from '../Screens/MyPage/ProfileScreen';
import TermsAndConditionsScreen from '../Screens/MyPage/TermsAndConditionsScreen';
import QuitScreen from '../Screens/MyPage/QuitScreen';
import PrivacyPolicyScreen from '../Screens/MyPage/PrivacyPolicyScreen';
import { CocktailDetailScreen } from '../Components/CocktailDetail/CocktailDetailScreen';
import RecommendationScreen from '../Screens/Recommend/RecommendationScreen';
import GuideScreen from '../Screens/Guide/GuideScreen';
import GuideDetailScreen from '../Screens/Guide/GuideDetail';
import CocktailBoxScreen from '../Screens/CocktailBox/CocktailBoxScreen';
import SearchResultScreen from '../Screens/SearchResult/SearchResultScreen';
import RecommendationIntroScreen from '../Screens/Recommend/RecommendationIntroScreen';
import LoadingVideoScreen from '../Screens/Recommend/LoadingVideoScreen';
import RecommendResultScreen from '../Screens/Recommend/RecommendResultScreen';
import { User } from '../model/domain/User';
import { CocktailDetail } from '../model/domain/CocktailDetail';
import AllCocktailScreen from '../Screens/AllCocktail/AllCocktailScreen';
import OnboardingScreen from '../Screens/Onboarding/OnboardingScreen';

interface NavigationProps {
  isOnboarded: boolean;
  setIsOnboarded: (val: boolean) => void;
}

export type BottomTabParamList = {
  홈: undefined;
  '칵테일 백과': undefined;
  '맞춤 추천': undefined;
  마이페이지: undefined;
};
export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Home: undefined;
  SearchScreen: { initialKeyword?: string };
  BottomTabNavigator: {
    screen?: string;
    params?: {
      shouldRefresh?: boolean;
    };
  };
  AllCocktailScreen: undefined;
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
  RecommendResultScreen: {
    result: CocktailDetail,
    answers: number[]
  };
  ProfileScreen: { user: User };
  QuitScreen: undefined;
  RecommendationIntro: undefined;
  LoadingVideoScreen: { answers: number[] };
  GuideScreen: undefined;
  GuideDetailScreen: {
    id: number,
    src: any,
    title: string
  };
  SignupScreen: { code?: string };
  TermsAndConditionsScreen: undefined;
  PrivacyPolicyScreen: undefined;
  CocktailDetailScreen: { cocktailId: number }
  SearchResultScreen: { keyword: string }
  CocktailBoxScreen: undefined

};
const Stack = createStackNavigator<RootStackParamList>();

const Navigation: React.FC<NavigationProps> = memo(({ isOnboarded, setIsOnboarded }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        // 초기 경로를 명시적으로 설정하여 엔진이 길을 잃지 않게 합니다.
        initialRouteName={isOnboarded ? 'BottomTabNavigator' : 'Onboarding'}
      >
        {isOnboarded ? (
          <>
            <Stack.Screen name="BottomTabNavigator" component={BottomTabNavigator} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="AllCocktailScreen" component={AllCocktailScreen} />
            <Stack.Screen name="CocktailDetailScreen" component={CocktailDetailScreen} />
            <Stack.Screen name="SearchScreen" component={SearchScreen} />
            <Stack.Screen name="SearchResultScreen" component={SearchResultScreen} />
            <Stack.Screen name="RecommendationHome" component={RecommendationScreen} />
            <Stack.Screen name="RecommendIntroScreen" component={RecommendationIntroScreen} />
            <Stack.Screen name="LoadingVideoScreen" component={LoadingVideoScreen} />
            <Stack.Screen name="RecommendResultScreen" component={RecommendResultScreen} />
            <Stack.Screen name="GuideScreen" component={GuideScreen} />
            <Stack.Screen name="GuideDetailScreen" component={GuideDetailScreen} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="QuitScreen" component={QuitScreen} />
            <Stack.Screen name="CocktailBoxScreen" component={CocktailBoxScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignupScreen" component={SignupScreen} />
            <Stack.Screen name="TermsAndConditionsScreen" component={TermsAndConditionsScreen} />
            <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
            <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
            <Stack.Screen name="ResultScreen" component={ResultScreen} />
          </>
        ) : (
          //  2. 온보딩이 안 된 경우 (인증/온보딩 스택)
          <>
            <Stack.Screen name="Onboarding">
              {(props) => <OnboardingScreen {...props} setIsOnboarded={setIsOnboarded} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
});

export default Navigation;
