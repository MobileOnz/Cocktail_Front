// Navigation.tsx
import React, { memo } from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { navigationRef } from '../lib/navigationRef';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../BottomTab/MyPage/Login/Login';
import Home from '../BottomTab/Home/HomeFeedScreen';
import SearchScreen from '../Screens/Search/SearchScreen';
import BottomTabNavigator from './BottomTabNavigator';
import SignupScreen from '../BottomTab/MyPage/Login/SignupScreen';
import ProfileScreen from '../BottomTab/MyPage/ProfileScreen';
import TermsAndConditionsScreen from '../BottomTab/MyPage/TermsAndConditionsScreen';
import QuitScreen from '../BottomTab/MyPage/QuitScreen';
import PrivacyPolicyScreen from '../BottomTab/MyPage/PrivacyPolicyScreen';
import InquiryFormScreen from '../BottomTab/MyPage/Inquiry/InquiryFormScreen';
import CocktailDetailScreen from '../Components/CocktailDetail/CocktailDetailScreen';
import RecommendationScreen from '../BottomTab/Recommend/RecommendationScreen';
import GuideScreen from '../BottomTab/Guide/GuideScreen';
import GuideDetailScreen from '../BottomTab/Guide/GuideDetail';
import CocktailBoxScreen from '../Screens/CocktailBox/CocktailBoxScreen';
import SearchResultScreen from '../Screens/SearchResult/SearchResultScreen';
import RecommendationIntroScreen from '../BottomTab/Recommend/RecommendationIntroScreen';
import LoadingVideoScreen from '../BottomTab/Recommend/LoadingVideoScreen';
import RecommendResultScreen from '../BottomTab/Recommend/RecommendResultScreen';
import { User } from '../model/domain/User';
import { CocktailDetail } from '../model/domain/CocktailDetail';
import AllCocktailScreen from '../Screens/AllCocktail/AllCocktailScreen';
import NewsScreen from '../BottomTab/News/NewsScreen';
import NewsDetailScreen from '../Screens/News/NewsDetailScreen';
import CocktailStepsScreen from '../Screens/Cocktail/CocktailStepsScreen';
import OnboardingScreen from '../Screens/Onboarding/OnboardingScreen';

interface NavigationProps {
  isOnboarded: boolean;
  setIsOnboarded: (val: boolean) => void;
}

export type BottomTabParamList = {
  홈: undefined;
  매거진: undefined;
  레시피북: undefined;
  바: undefined;
};
export type RootStackParamList = {
  Onboarding: undefined;
  Login: { redirect?: number } | undefined ;
  Home: undefined;
  SearchScreen: { initialKeyword?: string };
  BottomTabNavigator: {
    screen?: string;
    params?: {
      shouldRefresh?: boolean;
    };
  };
  AllCocktailScreen: undefined;
  RecommendationIntro: undefined;
  RecommendationScreen: undefined;
  RecommendResultScreen: {
    result: CocktailDetail,
    answers: number[]
  };
  ProfileScreen: { user: User };
  QuitScreen: undefined;
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
  SearchResultScreen: { keyword: string };
  CocktailBoxScreen: undefined;
  InquiryFormScreen: undefined;
  BarDetailScreen: { slug: string };
  VisitedBarsScreen: undefined;
  BarMenuScreen: { slug: string; barName?: string; notice?: string };
  QrScanScreen: { slug: string; barName?: string };
  BarChatScreen: { slug: string; barName?: string };
  NewsScreen: undefined;
  NewsDetailScreen: { newsId: number; preview?: any };
  CocktailStepsScreen: { cocktailId: number; cocktailName?: string };
  MyPageScreen: undefined;
};
const Stack = createStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['onzcocktail://', 'https://onz-cocktail.kr'],
  config: {
    screens: {
      CocktailDetailScreen: {
        path: 'cocktail/:cocktailId',
        parse: {
          cocktailId: (id: string) => Number(id),
        },
      },
      // QR 플래카드가 인코딩하는 유니버설 링크. 기본 카메라 앱으로 찍어도 여기로 들어온다.
      BarMenuScreen: {
        path: 'v/:slug',
      },
    },
  },
};

const Navigation: React.FC<NavigationProps> = memo(({ isOnboarded, setIsOnboarded }) => {
  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
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
            <Stack.Screen name="RecommendationScreen" component={RecommendationScreen} />
            <Stack.Screen name="RecommendationIntro" component={RecommendationIntroScreen} />
            <Stack.Screen name="BarDetailScreen" component={require('../Screens/Bar/BarDetailScreen').default} />
            <Stack.Screen name="VisitedBarsScreen" component={require('../Screens/Bar/VisitedBarsScreen').default} />
            <Stack.Screen name="BarMenuScreen" component={require('../Screens/Bar/BarMenuScreen').default} />
            <Stack.Screen name="QrScanScreen" component={require('../Screens/Bar/QrScanScreen').default} />
            <Stack.Screen name="BarChatScreen" component={require('../Screens/Bar/BarChatScreen').default} />
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
            <Stack.Screen name="InquiryFormScreen" component={InquiryFormScreen} />
            <Stack.Screen name="MyPageScreen" component={require('../BottomTab/MyPage/MyPageScreen').default} />
            <Stack.Screen name="NewsScreen" component={NewsScreen} />
            <Stack.Screen name="NewsDetailScreen" component={NewsDetailScreen} />
            <Stack.Screen name="CocktailStepsScreen" component={CocktailStepsScreen} />
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
