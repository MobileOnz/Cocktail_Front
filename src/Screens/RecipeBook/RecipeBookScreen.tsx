// RecipeBookScreen.tsx
// 탭3 "레시피북" — 레시피(칵테일) 전용. 가이드는 독립 탭으로 분리되어 세그먼트를 제거했다.
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {heightPercentage} from '../../assets/styles/FigmaScreen';
import AllCocktailScreen from '../AllCocktail/AllCocktailScreen';

const RecipeBookScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      {/* 제목·검색·필터는 AllCocktailScreen 의 embedded 헤더가 한 줄로 그린다.
          여기서는 상태바만 비켜준다 — 예전엔 이 화면이 제목+검색을, 아래쪽이 필터를
          따로 그려서 두 컨트롤이 다른 줄로 흩어져 있었다. */}
      <View style={{paddingTop: insets.top + heightPercentage(8)}} />

      <View style={styles.content}>
        <AllCocktailScreen embedded navigation={navigation} />
      </View>
    </View>
  );
};

export default RecipeBookScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFFFFF'},
  content: {flex: 1},
});
