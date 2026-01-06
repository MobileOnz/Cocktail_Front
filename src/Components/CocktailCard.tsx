// components/CocktailCard.tsx
import React from 'react';
import { View, Image, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PillStyleStatus from '../Components/PillStyleStatus';
import { heightPercentage, widthPercentage } from '../assets/styles/FigmaScreen';

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
            <Icon name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color="#FFF" />
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
    marginHorizontal: widthPercentage(15),
    marginVertical: heightPercentage(15),
  },
  card: {

    borderRadius: 20,
    overflow: 'hidden',
  },
  imageWrap: {
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
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
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignSelf: 'flex-start',

  },
});
