// components/CocktailCard.tsx
import React from 'react';
import { View, Image, Text, StyleSheet, Pressable } from 'react-native';
import PillStyleStatus from '../Components/PillStyleStatus';
import RemoteImage from './common/RemoteImage';
import { fontPercentage, heightPercentage, widthPercentage } from '../assets/styles/FigmaScreen';
import { fonts, night, round, space } from '../lib/theme';

type Props = {
  id: number;
  name: string;
  image: string;
  type: string;
  bookmarked?: boolean;
  /** 그리드에 놓일 때 부모가 계산한 칼럼 폭. 없으면 가로 캐러셀용 기본 폭. */
  width?: number;
  onPress?: () => void;
  onToggleBookmark?: (id: number, nextStatus: boolean) => void;
};

const CocktailCard = React.memo(function CocktailCard({
  id,
  name,
  type,
  image,
  bookmarked = false,
  width = DEFAULT_WIDTH,
  onPress,
  onToggleBookmark,
}: Props) {
  return (
    <View style={[styles.container, { width }]}>
      <Pressable onPress={onPress} style={[styles.card]}>
        {/* 이미지 영역 */}
        <View style={styles.imageWrap}>
          {/* FastImage 는 이미지가 도착하기 전까지 아무것도 그리지 않는다.
              흰 배경 위에서는 카드 전체가 사라진 것처럼 보였다(QA I-05).
              RemoteImage 는 로딩/실패에도 같은 크기의 자리를 지킨다. */}
          <RemoteImage
            uri={image}
            style={[styles.image, { width }]}
            resizeMode="cover"
            label={name}
            tone="light"
          />

          {/* 좌상단: 톤 라벨 */}
          <View style={styles.pillWrap}>
            <PillStyleStatus tone={type} />
          </View>

          {/* 우상단: 북마크 */}
          <Pressable
            hitSlop={10}
            onPress={() => onToggleBookmark?.(id, !bookmarked)}
            style={styles.bookmarkBtn}
            accessibilityLabel="즐겨찾기"
          >
            <Image
              source={
                bookmarked
                  ? require('../assets/drawable/full_save.png') // 채워진 이미지
                  : require('../assets/drawable/save.png')      // 비어있는 이미지
              }
              style={bookmarked ?
                { width: 20, height: 20, tintColor: '#FFFFFF' }
                : { width: 20, height: 20 }}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </Pressable>

      <Text numberOfLines={1} style={styles.title}>
        {name}
      </Text>
    </View>
  );
});

export default CocktailCard;


const DEFAULT_WIDTH = widthPercentage(160);

const styles = StyleSheet.create({
  // 폭은 부모가 정한다(그리드는 칼럼 폭, 캐러셀은 기본값).
  // 예전엔 카드가 고정 폭이라 레시피북 2열 그리드의 칼럼보다 살짝 넓어 우측이 밀려 나갔다.
  container: {
    alignItems: 'stretch',
  },
  card: {
    overflow: 'hidden',
  },
  imageWrap: {
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    borderRadius: round.sm,
    height: heightPercentage(220),
  },
  pillWrap: {
    position: 'absolute',
    top: space.sm,
    left: space.sm,
  },
  bookmarkBtn: {
    position: 'absolute',
    top: space.sm,
    right: space.sm,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 어두운 배경으로 바뀌었는데 글자색이 #1B1B1B 로 남아 있어 이름이 보이지 않았다.
  // 서체도 Regular 16 에 좌우 여백 10 이라 이미지 왼쪽 선과 어긋나 붕 떠 보였다.
  // → 밝은 본문색 + Medium, 이미지 왼쪽에 맞춰 흘려보낸다.
  title: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(15),
    lineHeight: fontPercentage(20),
    color: night.text,
    marginTop: space.sm,
  },
});
