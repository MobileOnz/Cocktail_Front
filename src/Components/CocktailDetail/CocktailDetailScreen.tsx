// CocktailDetailScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, Text, View, StyleSheet, Pressable, TouchableOpacity, Share, FlatList } from 'react-native';
import { ActivityIndicator, Divider } from 'react-native-paper';

import PillStyleStatus from '../PillStyleStatus';
import { RootStackParamList } from '../../Navigation/Navigation';
import { useNavigation } from '@react-navigation/native';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import useCocktailDetailViewModel from './CocktailDetailViewModel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CocktailCard from '../CocktailCard';
import Icon from 'react-native-vector-icons/Ionicons';
import { fonts } from '../../lib/theme';
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

// 백엔드 enum 이 그대로 노출되던 것(WEAK 등)을 한글로.
const ABV_LABEL: Record<string, string> = {
  WEAK: '약함',
  MEDIUM: '보통',
  STRONG: '강함',
};

export function CocktailDetailScreen({ route }: Props) {

  const insets = useSafeAreaInsets();

  const { cocktailId } = route.params;
  const navigation = useNavigation<any>();

  const vm = useCocktailDetailViewModel(cocktailId);
  const stay10sTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Image variant onError fallback to original imageUrl/glassImageUrl
  // (covers mock-S3 mode where variant URLs may 404 while real keys are pending).
  const [heroErrored, setHeroErrored] = useState(false);
  const [glassErrored, setGlassErrored] = useState(false);

  const handleShare = async () => {
    if (!vm.detail) { return; }
    const url = `https://onz-cocktail.kr/cocktail/${vm.detail.id}`;
    await Share.share({
      title: vm.detail.korName,
      message: `${vm.detail.korName} 칵테일을 확인해보세요!\n\n${url}`,
      url,
    });
  };

  useEffect(() => {
    if (!vm.detail) {return;}
    vm.trackViewDetail('cocktail_detail');
    stay10sTimerRef.current = setTimeout(() => {
      vm.trackStay10s('cocktail_detail');
    }, 10000);
    return () => {
      if (stay10sTimerRef.current) {clearTimeout(stay10sTimerRef.current);}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vm.detail]);

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
        <Image
          source={{
            uri: heroErrored
              ? vm.detail.imageUrl
              : (vm.detail.imageUrlDetail ?? vm.detail.imageUrl),
          }}
          style={styles.image}
          onError={() => setHeroErrored(true)}
        />

        {/* 상단 바 전체를 한 View에 묶기 */}
        <View style={[styles.imageHeader, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {/* 왼쪽: 뒤로가기 */}
          <TouchableOpacity onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back-sharp" size={24} color="#FFFFFF" style={{ marginRight: widthPercentage(30) }} />
          </TouchableOpacity>


          {/* 오른쪽: 북마크 + 공유 */}
          <View style={styles.imageHeaderRight}>
            <TouchableOpacity

              onPress={() => {
                if (vm.detail?.id) {
                  vm.bookmarked(Number(vm.detail.id));
                }
              }}
            >
              <Image
                source={
                  vm.detail?.isBookmarked
                    ? require('../../assets/drawable/full_save.png')
                    : require('../../assets/drawable/save.png')
                }
                style={[{ marginRight: 20 }, vm.detail?.isBookmarked ?
                  { width: 20, height: 20, tintColor: '#FFFFFF' }
                  : { width: 20, height: 20 }]}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleShare} style={{ marginRight: 10 }}>
              <Icon name="share-social-outline" size={24} color={'#FFFFFF'} />
            </TouchableOpacity>

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
          <Text style={[styles.valueText, { letterSpacing: 0.57 }]}>{vm.detail.originText}</Text>
        </DetailRow>

        <Divider style={styles.sectionDivider} />

        <DetailRow label="도수">
          <Text style={styles.valueText}> {ABV_LABEL[vm.detail.abvBand] ?? vm.detail.abvBand}</Text>
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
          <Image
            source={{
              uri: glassErrored
                ? vm.detail.glassImageUrl
                : (vm.detail.glassImageUrlDetail ?? vm.detail.glassImageUrl),
            }}
            style={styles.glassImage}
            onError={() => setGlassErrored(true)}
          />
        </DetailRow>
      </View>


      <Divider style={styles.Divider} />

      {/* 만드는 법 — 재료만 있고 제조 단계가 없던 갭을 백엔드 T-07(/steps)로 해소 */}
      <TouchableOpacity
        style={styles.stepsCta}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`${vm.detail.korName} 만드는 법 보기`}
        onPress={() =>
          navigation.navigate('CocktailStepsScreen', {
            cocktailId: vm.detail!.id,
            cocktailName: vm.detail!.korName,
          })
        }
      >
        <View style={styles.stepsCtaTextWrap}>
          <Text style={styles.stepsCtaTitle}>만드는 법</Text>
          <Text style={styles.stepsCtaSub}>단계별로 따라 해보세요</Text>
        </View>
        <Text style={styles.stepsCtaArrow}>›</Text>
      </TouchableOpacity>

      <Divider style={styles.Divider} />

      <Text style={styles.valueText}>이 칵테일, 입문자도 즐길 수 있을까요?</Text>
      <View style={styles.buttonContainer}>
        <Pressable style={[styles.button,
        vm.myReaction === 'RECOMMEND' && { backgroundColor: '#333' }]}
          onPress={() => { vm.handleReaction('RECOMMEND'); }}>
          <Text style={[styles.text, vm.myReaction === 'RECOMMEND' && { color: '#FFFFFF' }]}>
            추천해요 🍸</Text>
        </Pressable>
        <Pressable style={[styles.button,
        vm.myReaction === 'HARD' && { backgroundColor: '#333' }]}
          onPress={() => { vm.handleReaction('HARD'); }}>
          <Text style={[styles.text, vm.myReaction === 'HARD' && { color: '#FFFFFF' }]}>
            조금 어려워요🤔</Text>
        </Pressable>
      </View>

      <Text style={styles.valueText}>이런 잔은 어떠세요?</Text>
      <FlatList
        data={vm.recommendedCocktails}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `recommended-${item.id}`}
        style={{ marginTop: heightPercentage(16) }}
        contentContainerStyle={{
          paddingLeft: widthPercentage(16),
          paddingRight: widthPercentage(16),
        }}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
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

      {/*
        가이드 진입점 ③ — 칵테일 상세 하단 "이 칵테일의 이야기".
        TODO(T-09/T-13): 백엔드 CocktailDetail 에 guidePart(number|null) 필드가 추가되면
        해당 파트의 GuideDetailScreen 으로 딥하게 보낸다. 그 전까지는 가이드 목록으로 보낸다.
      */}
      <Text style={styles.valueText}>이 칵테일의 이야기</Text>
      <TouchableOpacity
        style={styles.storyCard}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel="이 칵테일의 이야기 보러가기"
        onPress={() => {
          const guidePart = (vm.detail as any)?.guidePart;
          if (guidePart) {
            navigation.navigate('GuideDetailScreen', {
              id: guidePart,
              src: vm.detail?.imageUrl,
              title: vm.detail?.korName ?? '칵테일 가이드',
            });
          } else {
            navigation.navigate('GuideScreen');
          }
        }}
      >
        <Text style={styles.storyCardTitle}>칵테일 가이드에서 더 읽기</Text>
        <Text style={styles.storyCardBody} numberOfLines={2}>
          {vm.detail?.originText
            ? vm.detail.originText
            : '이 칵테일이 태어난 배경과 바 문화의 이야기를 가이드에서 만나보세요.'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: heightPercentage(100) }} />
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
    marginHorizontal: widthPercentage(10),
    marginTop: heightPercentage(21),
    marginBottom: heightPercentage(52),
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
    fontFamily: 'Pretendard-Regular',
    fontSize: fontPercentage(16),
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
    paddingLeft: widthPercentage(16),
    paddingRight: widthPercentage(10),
  },
  valueWrapper: {
    flex: 1,
  },
  valueText: {
    marginLeft: widthPercentage(20),
    fontFamily: 'Pretendard-Regular',
    color: '#1B1B1B',
    fontSize: fontPercentage(16),
  },
  stepsCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: widthPercentage(20),
    paddingVertical: heightPercentage(14),
    paddingHorizontal: widthPercentage(16),
    borderRadius: widthPercentage(12),
    backgroundColor: '#1B1B1B',
  },
  stepsCtaTextWrap: { flex: 1 },
  stepsCtaTitle: {
    fontFamily: 'Pretendard-Medium',
    fontSize: fontPercentage(16),
    color: '#FFFFFF',
  },
  stepsCtaSub: {
    marginTop: heightPercentage(2),
    fontFamily: 'Pretendard-Regular',
    fontSize: fontPercentage(13),
    color: '#BDBDBD',
  },
  stepsCtaArrow: { fontFamily: fonts.regular, fontSize: fontPercentage(22), color: '#FFFFFF' },
  storyCard: {
    marginTop: heightPercentage(12),
    marginHorizontal: widthPercentage(20),
    padding: widthPercentage(16),
    borderRadius: widthPercentage(12),
    backgroundColor: '#F5F5F5',
  },
  storyCardTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: fontPercentage(14),
    color: '#1B1B1B',
    marginBottom: heightPercentage(6),
  },
  storyCardBody: {
    fontFamily: 'Pretendard-Regular',
    fontSize: fontPercentage(13),
    color: '#616161',
    lineHeight: fontPercentage(20),
  },
  label: {
    fontFamily: 'Pretendard-Medium',
    width: widthPercentage(60),
    fontSize: fontPercentage(12),
    color: '#616161',
  },
  contentWrapper: {

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
    fontFamily: 'Pretendard-Medium',
    position: 'absolute',
    left: 20,
    bottom: 40,
    fontSize: fontPercentage(20),
    color: '#FFFFFF',
  },
  engText: {
    fontFamily: 'Pretendard-Bold',
    position: 'absolute',
    left: 20,
    bottom: 75,
    fontSize: fontPercentage(20),
    color: '#FFFFFF',
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
    color: '#616161',
    marginRight: widthPercentage(10),
  },
  summary: {
    fontFamily: 'Pretendard-Medium',
    marginTop: 8,
  },

  // 섹션 제목 공통
  sectionTitle: {
    // fontWeight:'700' 을 함께 주면 Android 가 Pretendard-Medium_bold.otf 를 찾다 실패해
    // Roboto 합성 볼드로 떨어진다. 굵기는 파일명으로만 지정한다.
    fontFamily: 'Pretendard-Bold',
    marginTop: 16,
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
export default CocktailDetailScreen;
