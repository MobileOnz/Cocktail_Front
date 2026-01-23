// CocktailDetailScreen.tsx
import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, Text, View, StyleSheet, Pressable } from 'react-native';
import { ActivityIndicator, Divider, IconButton } from 'react-native-paper';

import PillStyleStatus from '../PillStyleStatus';
import { RootStackParamList } from '../../Navigation/Navigation';
import { useNavigation } from '@react-navigation/native';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import useCocktailDetailViewModel from './CocktailDetailViewModel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatList } from 'react-native-gesture-handler';
import CocktailCard from '../CocktailCard';

type Props = NativeStackScreenProps<RootStackParamList, 'CocktailDetailScreen'>;

const DetailRow = ({
  label,
  children,
  align = 'flex-start',
}: {
  label: string;
  children: React.ReactNode;
  align?: 'center' | 'flex-start';
}) => {
  return (
    <View style={[styles.row, { alignItems: align }]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueWrapper}>
        {children}
      </View>
    </View>
  );
};

export function CocktailDetailScreen({ route }: Props) {

  const insets = useSafeAreaInsets();

  const { cocktailId } = route.params;
  const navigation = useNavigation<any>();

  const vm = useCocktailDetailViewModel(cocktailId);

  //  로딩 상태
  if (vm.loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>불러오는 중...</Text>
      </View>
    );
  }

  //  에러 상태
  if (vm.error || !vm.detail) {
    return (
      <View style={styles.centerContainer}>
        <Text>{vm.error ?? '칵테일 정보를 찾을 수 없습니다.'}</Text>
      </View>
    );
  }

  // 정상 렌더링
  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: vm.detail.imageUrl }} style={styles.image} />

        {/* 상단 바 전체를 한 View에 묶기 */}
        <View style={[styles.imageHeader, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {/* 왼쪽: 뒤로가기 */}
          <IconButton
            icon="chevron-left"
            size={30}
            iconColor="#fff"
            onPress={() => navigation.goBack()}
          />

          {/* 오른쪽: 북마크 + 공유 */}
          <View style={styles.imageHeaderRight}>
            <IconButton
              icon={vm.detail?.isBookmarked ? 'bookmark' : 'bookmark-outline'}
              iconColor="#fff"
              onPress={() => {
                if (vm.detail?.id) {
                  vm.bookmarked(Number(vm.detail.id)); // Integer 대신 Number 사용
                }
              }} />
            <IconButton icon="share-outline" size={24} iconColor="#fff" onPress={() => { }} />
          </View>
        </View>
        <Text style={styles.korText}>{vm.detail.korName}</Text>
        <Text style={styles.engText}>{vm.detail.engName}</Text>
      </View>


      {/* 스타일 */}
      <View style={styles.contentWrapper}>
        <DetailRow label="스타일" align="center">
          <PillStyleStatus tone={vm.detail.style} />
        </DetailRow>

        <DetailRow label="유래·역사">
          <Text style={styles.valueText}>{vm.detail.originText}</Text>
        </DetailRow>

        <Divider style={styles.sectionDivider} />

        <DetailRow label="도수">
          <Text style={styles.valueText}> {vm.detail.abvBand}</Text>
        </DetailRow>
        <DetailRow label="맛">
          <Text style={styles.valueText}>
            {vm.detail.flavors.join(' • ')}
          </Text>
        </DetailRow>
        <DetailRow label="분위기">
          <Text style={styles.valueText}> {vm.detail.moods.join(' • ')}</Text>
        </DetailRow>
        <DetailRow label="계절">
          <Text style={styles.valueText}> {vm.detail.season}</Text>
        </DetailRow>
        <DetailRow label="베이스">
          <Text style={styles.valueText}> {vm.detail.base}</Text>
        </DetailRow>
        <DetailRow label="재료">
          <View style={{ flexDirection: 'column', gap: 6 }}>
            {vm.detail.ingredients.map((item, index) => (
              <Text key={`ingredient-${index}`} style={styles.valueText}>
                {item}
              </Text>
            ))}
          </View>
        </DetailRow>
        {/* 추후 넣기 */}
        <DetailRow label="잔 유형">
          <Text style={styles.valueText}> {vm.detail.glassType}</Text>
          <Image source={{ uri: vm.detail.glassImageUrl }} style={styles.glassImage} />
        </DetailRow>
      </View>


      <Divider style={styles.Divider} />


      <Text style={styles.valueText}>이 칵테일, 입문자도 즐길 수 있을까요?</Text>
      <View style={styles.buttonContainer}>
        <Pressable style={[styles.button,
        vm.myReaction === 'RECOMMEND' && { backgroundColor: '#333' }]}
          onPress={() => { vm.handleReaction('RECOMMEND'); }}>
          <Text style={[styles.text, vm.myReaction === 'RECOMMEND' && { color: '#FFF' }]}>
            추천해요 🍸</Text>
        </Pressable>
        <Pressable style={[styles.button,
        vm.myReaction === 'RECOMMEND' && { backgroundColor: '#333' }]}
          onPress={() => { vm.handleReaction('HARD'); }}>
          <Text style={[styles.text, vm.myReaction === 'HARD' && { color: '#FFF' }]}>
            조금 어려워요🤔</Text>
        </Pressable>
      </View>

      <Text style={styles.valueText}>이런 잔은 어떠세요?</Text>
      <FlatList
        data={vm.recommendedCocktails}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `recommended-${item.id}`}
        renderItem={({ item }) => (
          <CocktailCard
            id={item.id}
            name={item.name}
            image={item.image}
            type={item.type}
            bookmarked={item.isBookmarked}
            onPress={() =>
              navigation.navigate('CocktailDetailScreen', {
                cocktailId: item.id,
              })
            }
            onToggleBookmark={() => {
              vm.bookmarked(item.id);
            }}
          />
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 10,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: widthPercentage(170),
    height: heightPercentage(55),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Pretendard-Medium',
    fontSize: fontPercentage(16),
    fontWeight: '600',
    color: '#1B1B1B',
  },
  sectionDivider: {
    marginVertical: heightPercentage(32),
    height: 4,
    backgroundColor: '#e8e8e8',
  },
  Divider: {
    marginVertical: heightPercentage(32),
    height: 12,
    backgroundColor: '#e8e8e8',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: heightPercentage(10),
  },
  valueWrapper: {
    flex: 1,
  },
  valueText: {
    marginLeft: widthPercentage(20),
    fontFamily: 'Pretendard-Medium',
    color: '#1B1B1B',
    fontSize: fontPercentage(16),
    fontWeight: '500',
  },
  label: {
    fontFamily: 'Pretendard-Medium',
    width: widthPercentage(60),
    fontSize: fontPercentage(12),
    fontWeight: '500',
    color: '#616161',
  },
  contentWrapper: {
    marginHorizontal: widthPercentage(10),
    marginVertical: heightPercentage(15),
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassImage: {
    width: '100%',
    height: heightPercentage(420),
    resizeMode: 'cover',
  },

  // 로딩 텍스트
  loadingText: {
    fontFamily: 'Pretendard-Medium',
    marginTop: 8,
  },
  imageContainer: {
    position: 'relative',
  },

  // 이미지
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
    resizeMode: 'cover',
  },
  korText: {
    fontFamily: 'Pretendard-SemiBold',
    position: 'absolute',
    left: 20,
    bottom: 40,
    fontWeight: '600',
    fontSize: fontPercentage(20),
    color: '#FFF',
  },
  engText: {
    fontStyle: 'italic',
    fontFamily: 'NotoSerif-BoldItalic',
    position: 'absolute',
    left: 20,
    bottom: 70,
    fontWeight: '700',
    fontSize: fontPercentage(20),
    color: '#FFF',
  },
  imageHeader: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusWrapper: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  // 타이틀 & 요약
  fontStyle: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    fontWeight: '700',
    color: '#616161',
    marginRight: widthPercentage(10),
  },
  summary: {
    fontFamily: 'Pretendard-Medium',
    marginTop: 8,
  },

  // 섹션 제목 공통
  sectionTitle: {
    fontFamily: 'Pretendard-Medium',
    marginTop: 16,
    fontWeight: '700',
  },

  // 스토리 본문
  story: {
    fontFamily: 'Pretendard-Medium',
    marginTop: 4,
  },

  infoBox: {
    marginTop: 16,
  },

  footerBox: {
    marginTop: 16,
    marginBottom: 24,
  },
});
