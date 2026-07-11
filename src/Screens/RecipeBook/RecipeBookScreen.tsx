// RecipeBookScreen.tsx
// 탭3 "레시피북" — 레시피(칵테일) 전용. 가이드는 독립 탭으로 분리되어 세그먼트를 제거했다.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import AllCocktailScreen from '../AllCocktail/AllCocktailScreen';

const RecipeBookScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + heightPercentage(8) }]}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>레시피 북</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SearchScreen')}
            style={styles.searchButton}
            accessibilityRole="button"
            accessibilityLabel="칵테일 검색"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image
              source={require('../../assets/drawable/SharpSearch.png')}
              style={styles.searchIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <AllCocktailScreen embedded navigation={navigation} />
      </View>
    </View>
  );
};

export default RecipeBookScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: widthPercentage(20),
    backgroundColor: '#FFFFFF',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: fontPercentage(24),
    fontFamily: 'Pretendard-Bold',
    color: '#1B1B1B',
  },
  searchButton: {
    width: widthPercentage(36),
    height: widthPercentage(36),
    borderRadius: widthPercentage(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  searchIcon: { width: widthPercentage(18), height: widthPercentage(18) },
  content: { flex: 1 },
});
