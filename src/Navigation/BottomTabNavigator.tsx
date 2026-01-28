import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from '@react-native-community/blur';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import Home from '../BottomTab/Cocktail_List/CocktailListScreen';
import RecommendationIntroScreen from '../Screens/Recommend/RecommendationIntroScreen';
import LinearGradient from 'react-native-linear-gradient';

// import { isTokenExpired } from '../tokenRequest/Token';
import { BottomTabParamList } from './Navigation';
import GuideScreen from '../Screens/Guide/GuideScreen';
import HomeIcon from '../assets/drawable/Home.svg';
import RecommendIcon from '../assets/drawable/Cocktail.svg';
import GuideIcon from '../assets/drawable/Guide.svg';
import MyPageIcon from '../assets/drawable/MyPage.svg';
import MyPageScreen from '../Screens/MyPage/MyPageScreen';
import { heightPercentage } from '../assets/styles/FigmaScreen';
import { useNavigationState } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator<BottomTabParamList>();
export const ICON_PATH = {
  홈: HomeIcon,
  '맞춤 추천': RecommendIcon,
  가이드: GuideIcon,
  마이페이지: MyPageIcon,
} as const;

const TabBarBackground = () => {
  const state = useNavigationState(state => state);
  const currentRouteName = state?.routes[state.index]?.name;
  const isMyPage = currentRouteName === '마이페이지';
  return (
    <View style={styles.container}>
      <BlurView
        blurType={isMyPage ? 'light' : 'dark'}
        blurAmount={isMyPage ? 10 : 1}
        reducedTransparencyFallbackColor="transparent"
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: isMyPage ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.2)' },
        ]}
      />

      <LinearGradient
        style={StyleSheet.absoluteFill}
        colors={[
          'rgba(255, 255, 255, 0.15)',
          'transparent',
          'rgba(255, 255, 255, 0.15)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
    </View>
  );
};

const BottomTabNavigator = () => {

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="홈"
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          tabBarBackground: () => <TabBarBackground />,
          tabBarStyle: {
            position: 'absolute',
            marginHorizontal: 10,
            bottom: 30,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 15,
            elevation: 0,
            height: heightPercentage(58),
            borderRadius: 999,
            overflow: 'hidden',
            paddingBottom: 0,
            paddingTop: 0,
          },
          tabBarIconStyle: {
            width: '100%',
            height: '100%',
            marginBottom: 0,
            marginTop: 0,
          },
          tabBarItemStyle: {
            height: heightPercentage(58),
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarIcon: ({ focused }) => {

            const IconComponent =
              ICON_PATH[route.name as keyof typeof ICON_PATH] ?? ICON_PATH['홈'];
            const isMyPageTab = route.name === '마이페이지';

            let c;
            if (isMyPageTab) {
              c = focused ? '#000000' : '#E0E0E0';
            } else {
              c = focused ? '#FFFFFF' : '#E0E0E0';
            }

            return (
              <IconComponent
                width={40}
                height={40}
                color={c}
              />
            );
          },
        })}
      >
        <Tab.Screen name="홈" component={Home} options={{ headerShown: false }} />
        <Tab.Screen
          name="맞춤 추천"
          component={RecommendationIntroScreen}
          options={{
            headerShown: false,
          }}
          listeners={({ navigation }) => ({
            tabPress: async e => {
              e.preventDefault(); // ❗ 탭 전환 막기
              
              // 로그인 시에만 접근 가능하게 하기
              const loggedIn = await AsyncStorage.getItem('accessToken');
              console.log(loggedIn)
              if (!loggedIn) {
                navigation.navigate('Login', {
                  redirect: 1
                });
                return;
              }
              
              navigation.getParent()?.navigate('RecommendIntroScreen');
            }    
          })}
        />

        <Tab.Screen
          name="가이드"
          component={GuideScreen}
          options={{
            headerShown: false,
          }}
        />

        <Tab.Screen name="마이페이지" component={MyPageScreen} options={{ headerShown: false }} />
      </Tab.Navigator>


    </View>
  );
};

export default BottomTabNavigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245, 245, 245, 1)',
  },
  absolute: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
});
