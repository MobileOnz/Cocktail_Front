// CocktailDetailScreen.tsx
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, Text, View, StyleSheet, Pressable } from 'react-native';
import { ActivityIndicator, Divider, IconButton } from 'react-native-paper';

import PillStyleStatus from '../PillStyleStatus';
import { RootStackParamList } from '../../Navigation/Navigation';
import { useNavigation } from '@react-navigation/native';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import useCocktailDetailViewModel from './CocktailDetailViewModel';

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

  const { cocktailId } = route.params;
  const navigation = useNavigation();

  const { detail, loading, error } = useCocktailDetailViewModel(cocktailId);

  //  로딩 상태
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>불러오는 중...</Text>
      </View>
    );
  }

  //  에러 상태
  if (error || !detail) {
    return (
      <View style={styles.centerContainer}>
        <Text>{error ?? '칵테일 정보를 찾을 수 없습니다.'}</Text>
      </View>
    );
  }

  // 정상 렌더링
  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: detail.imageUrl }} style={styles.image} />

        {/* 상단 바 전체를 한 View에 묶기 */}
        <View style={styles.imageHeader}>
          {/* 왼쪽: 뒤로가기 */}
          <IconButton
            icon="chevron-left"
            size={40}
            iconColor="#fff"
            onPress={() => navigation.goBack()}
          />

          {/* 오른쪽: 북마크 + 공유 */}
          <View style={styles.imageHeaderRight}>
            <IconButton icon="bookmark-outline" size={24} iconColor="#fff" onPress={() => { }} />
            <IconButton icon="share-outline" size={24} iconColor="#fff" onPress={() => { }} />
          </View>
        </View>
        <Text style={styles.korText}>{detail.korName}</Text>
        <Text style={styles.engText}>{detail.engName}</Text>
      </View>


      {/* 스타일 */}
      <View style={styles.contentWrapper}>
        <DetailRow label="스타일" align="center">
          <PillStyleStatus tone={detail.style} />
        </DetailRow>

        <DetailRow label="유래·역사">
          <Text style={styles.valueText}>{detail.originText}</Text>
        </DetailRow>

        <Divider style={styles.sectionDivider} />

        <DetailRow label="도수">
          <Text style={styles.valueText}> {detail.abvBand}</Text>
        </DetailRow>
        <DetailRow label="맛">
          <Text style={styles.valueText}>
            {detail.flavors.join(' • ')}
          </Text>
        </DetailRow>
        <DetailRow label="분위기">
          <Text style={styles.valueText}> {detail.moods.join(' • ')}</Text>
        </DetailRow>
        <DetailRow label="계절">
          <Text style={styles.valueText}> {detail.season}</Text>
        </DetailRow>
        <DetailRow label="베이스">
          <Text style={styles.valueText}> {detail.base}</Text>
        </DetailRow>
        <DetailRow label="재료">
          <View style={{ flexDirection: 'column', gap: 6 }}>
            {detail.ingredients.map((item, index) => (
              <Text key={`ingredient-${index}`} style={styles.valueText}>
                {item}
              </Text>
            ))}
          </View>
        </DetailRow>
        {/* 추후 넣기 */}
        <DetailRow label="잔 유형">
          <Text style={styles.valueText}> {detail.glassType}</Text>
          <Image source={{ uri: detail.glassImageUrl }} style={styles.glassImage} />
        </DetailRow>
      </View>


      <Divider style={styles.Divider} />


      <Text style={styles.valueText}>   이 칵테일, 입문자도 즐길 수 있을까요?</Text>
      <View style={styles.buttonContainer}>
        <Pressable style={[styles.button, { marginRight: widthPercentage(10) }]} onPress={() => { }}>
          <Text style={styles.text}>추천해요 🍸</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => { }}>
          <Text style={styles.text}>조금 어려워요🤔</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // 공통 컨테이너
  container: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 10,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: widthPercentage(140),
    height: heightPercentage(45),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
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
    color: '#1B1B1B',
    fontSize: fontPercentage(16),
    fontWeight: '500',
  },
  label: {
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
    position: 'absolute',
    left: 20,
    bottom: 70,
    fontWeight: '700',
    fontSize: fontPercentage(20),
    color: '#FFF',
  },
  engText: {
    position: 'absolute',
    left: 20,
    bottom: 40,
    fontWeight: '600',
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
    fontSize: 12,
    fontWeight: '700',
    color: '#616161',
    marginRight: widthPercentage(10),
  },
  summary: {
    marginTop: 8,
  },

  // 섹션 제목 공통
  sectionTitle: {
    marginTop: 16,
    fontWeight: '700',
  },

  // 스토리 본문
  story: {
    marginTop: 4,
  },

  // 정보 박스 (도수/베이스/카테고리/맛/바디감, 재료 등)
  infoBox: {
    marginTop: 16,
  },

  // 마지막 영역
  footerBox: {
    marginTop: 16,
    marginBottom: 24,
  },
});
