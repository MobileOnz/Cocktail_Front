// components/CocktailCard.tsx
import React from 'react';
import { View, Image, Text, StyleSheet, Pressable } from 'react-native';
import PillStyleStatus from '../Components/PillStyleStatus';
import { fontPercentage, heightPercentage, widthPercentage } from '../assets/styles/FigmaScreen';

type Props = {
  id: number;
  name: string;
  image: string;
  type: string;
  bookmarked?: boolean;
  onPress?: () => void;
  onToggleBookmark?: (id: number, nextStatus: boolean) => void;
};

export default function CocktailCard({
  id,
  name,
  type,
  image,
  bookmarked = false,
  onPress,
  onToggleBookmark,
}: Props) {
  return (
    <View style={styles.container}>
      <Pressable onPress={onPress} style={[styles.card]}>
        {/* 이미지 영역 */}
        <View style={styles.imageWrap}>
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />

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
                { width: 20, height: 20, tintColor: '#FFF' }
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
}


const styles = StyleSheet.create({
  container: {
    width: 160,
    alignItems: 'center',
  },
  card: {
    overflow: 'hidden',
  },
  imageWrap: {
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    borderRadius: 8,
    width: widthPercentage(160),
    height: heightPercentage(220),
    resizeMode: 'contain',
  },
  pillWrap: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  bookmarkBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Pretendard-Medium',
    fontSize: fontPercentage(16),
    fontWeight: '500',
    color: '#1B1B1B',
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignSelf: 'flex-start',

  },
});
