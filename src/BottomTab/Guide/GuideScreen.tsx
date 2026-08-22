import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigation/Navigation';
import { widthPercentage, heightPercentage, fontPercentage } from '../../assets/styles/FigmaScreen';
import RemoteImage from '../../Components/common/RemoteImage';
import GuideDetailViewModel from './GuideDetailViewModel';
import { GuideSummary } from '../../model/domain/GuideSummary';
import { colors, fonts } from '../../lib/theme';

type GuideSreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'GuideScreen'
>;

interface Props {
  navigation: GuideSreenNavigationProp | any;
  /** RecipeBookScreen 안에 세그먼트로 들어갈 때 자체 헤더/세이프에어리어를 생략한다. */
  embedded?: boolean;
}

const GuideScreen: React.FC<Props> = ({ navigation, embedded = false }) => {
  // 보기 방식: 0=카드(큰 썸네일) / 1=그리드 / 2=줄글(텍스트 리스트)
  const [viewType, setviewType] = useState(0);
  // 정렬: part 순(기본) / 제목 가나다순
  const [sortMode, setSortMode] = useState<'part' | 'name'>('part');
  // null = 전체. 카테고리 목록은 서버 데이터에서 등장 순서대로 뽑는다 —
  // 어드민에서 카테고리를 추가하면 앱 수정 없이 탭이 늘어난다.
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { guideList, getGuideList, loading } = GuideDetailViewModel();

  const categories = React.useMemo(() => {
    const seen: string[] = [];
    let hasUncategorized = false;
    guideList.forEach(g => {
      const c = g.category?.trim();
      if (c) {
        if (!seen.includes(c)) { seen.push(c); }
      } else {
        hasUncategorized = true;
      }
    });
    return hasUncategorized && seen.length > 0 ? [...seen, '기타'] : seen;
  }, [guideList]);

  const filteredList = React.useMemo(() => {
    if (selectedCategory === null) { return guideList; }
    return guideList.filter(g => (g.category?.trim() || '기타') === selectedCategory);
  }, [guideList, selectedCategory]);

  const displayList = React.useMemo(() => {
    const arr = [...filteredList];
    if (sortMode === 'name') {
      arr.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    } else {
      arr.sort((a, b) => a.part - b.part);
    }
    return arr;
  }, [filteredList, sortMode]);

  useEffect(() => {
    getGuideList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewType]);

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const Root: React.ComponentType<any> = embedded ? View : SafeAreaView;

  return (
    <Root style={styles.rootContainer}>
      {/* 상단 뷰 — embedded 일 때는 제목을 부모(RecipeBookScreen)가 그리므로 보기전환 버튼만 남긴다 */}
      <View style={[styles.header, embedded && styles.headerEmbedded]}>

        {!embedded && <Text style={styles.headerTitle}>칵테일 가이드</Text>}

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => setSortMode(m => (m === 'part' ? 'name' : 'part'))}
            style={styles.sortBtn}
            accessibilityRole="button"
            accessibilityLabel={sortMode === 'part' ? '가나다순으로 정렬' : '기본순으로 정렬'}
            hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          >
            <Text style={styles.sortText}>{sortMode === 'part' ? '기본순' : '가나다순'} ↕</Text>
          </TouchableOpacity>
          <View style={styles.viewSeg}>
            {([
              { mode: 0, glyph: '▤', label: '카드 보기' },
              { mode: 1, glyph: '▦', label: '그리드 보기' },
              { mode: 2, glyph: '☰', label: '줄글 보기' },
            ] as const).map(v => (
              <TouchableOpacity
                key={v.mode}
                onPress={() => setviewType(v.mode)}
                style={[styles.viewSegBtn, viewType === v.mode && styles.viewSegBtnActive]}
                accessibilityRole="button"
                accessibilityLabel={v.label}
                accessibilityState={{ selected: viewType === v.mode }}
              >
                <Text style={[styles.viewSegGlyph, viewType === v.mode && styles.viewSegGlyphActive]}>{v.glyph}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {categories.length >= 2 && (
        <View style={styles.categoryBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryBarContent}>
            {[null, ...categories].map(cat => (
              <TouchableOpacity
                key={cat ?? '전체'}
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedCategory === cat }}
              >
                <Text style={[styles.categoryLabel, selectedCategory === cat && styles.categoryLabelActive]}>
                  {cat ?? '전체'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.centralContainer}>
        {!loading && (
          viewType === 0 ? (
            <ListView data={displayList} navigation={navigation} />
          ) : viewType === 1 ? (
            <GridView data={displayList} navigation={navigation} />
          ) : (
            <CompactView data={displayList} navigation={navigation} />
          )
        )}
      </View>
    </Root>
  );

};

const ListView = ({ data, navigation } : {
  data: GuideSummary[],
  navigation: any
}) => {
  return (
    <ScrollView
      style={styles.listRoot}
      contentContainerStyle={{paddingBottom: heightPercentage(100)}}
      showsVerticalScrollIndicator={false}
    >
      {data.map((item: GuideSummary) => (
        <TouchableOpacity
          activeOpacity={0.95}
          key={item.part}
          style={styles.listItem}
          onPress={() => navigation.navigate('NewsDetailScreen', { newsId: item.part })}
        >
          {/* 흰 글씨를 사진 위에 얹는 카드다. 사진이 늦게 오면 흰 배경 + 흰 글씨가 되어
              화면이 통째로 백지로 보였다(QA I-09). 어두운 플레이스홀더가 그 사이를 메운다. */}
          <RemoteImage
            uri={item.imageUrl}
            style={styles.listImage}
            resizeMode="cover"
            tone="dark"
            glyphSize={44}
            accessibilityLabel={item.title}
          />

          {/* 이미지가 밝아도 글씨가 읽히도록 하단 스크림을 깐다. */}
          <View style={styles.scrim} pointerEvents="none" />

          <View style={styles.bottomTextContainer}>
              <View style={styles.tagContainer}>
                <Text style={styles.listBadge}>Part.{getPart(item.part)}</Text>
              </View>
              <Text style={styles.listText}>{item.title}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const GridView = ({ data, navigation }
  : {
  data: GuideSummary[],
  navigation: any
}) => {
  return (
    <FlatList
      data={data}
      numColumns={2}
      style={styles.listRoot}
      key={'grid'}
      columnWrapperStyle={{ justifyContent: 'space-between' }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (

        <TouchableOpacity
          activeOpacity={0.9}
          key={item.part}
          style={styles.gridItem}
          onPress={() => navigation.navigate('NewsDetailScreen', { newsId: item.part })}
        >
            <RemoteImage
              uri={item.imageUrl}
              style={styles.gridImage}
              resizeMode="cover"
              tone="dark"
              glyphSize={30}
              accessibilityLabel={item.title}
            />

            <View style={styles.scrimGrid} pointerEvents="none" />

            <View style={styles.bottomGrideTextContainer}>
                <View style={styles.tagGridContainer}>
                  <Text style={styles.listGridBadge}>Part.{getPart(item.part)}</Text>
                </View>
                <Text style={styles.listGridText}>{item.title}</Text>
            </View>
        </TouchableOpacity>
      )}
      keyExtractor={(item: GuideSummary) => item.part.toString()}
    />
  );
};

const CompactView = ({ data, navigation } : {
  data: GuideSummary[],
  navigation: any
}) => {
  return (
    <ScrollView
      style={styles.listRoot}
      contentContainerStyle={{ paddingBottom: heightPercentage(100) }}
      showsVerticalScrollIndicator={false}
    >
      {data.map((item: GuideSummary) => (
        <TouchableOpacity
          key={item.part}
          style={styles.compactRow}
          onPress={() => navigation.navigate('NewsDetailScreen', { newsId: item.part })}
          accessibilityRole="button"
          accessibilityLabel={`가이드 ${item.title} 열기`}
        >
          <Text style={styles.compactBadge}>Part.{getPart(item.part)}</Text>
          <View style={styles.compactBody}>
            <Text style={styles.compactTitle} numberOfLines={1}>{item.title}</Text>
            {item.category ? <Text style={styles.compactCategory}>{item.category}</Text> : null}
          </View>
          <Text style={styles.compactChevron}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const getPart = (value: number) => {
  return Math.floor(value / 100);
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: heightPercentage(14),
    paddingLeft: widthPercentage(16),
    paddingRight: widthPercentage(16),
    paddingBottom: heightPercentage(10),
  },
  headerEmbedded: {
    justifyContent: 'flex-end',
    paddingTop: heightPercentage(8),
  },
  headerTitle: {
    fontSize: fontPercentage(20),
    color: '#1B1B1B',
    fontFamily: fonts.medium,
  },
  icon: {
    width: widthPercentage(24),
    height: widthPercentage(24),
    resizeMode: 'contain',
  },
  centralContainer: {
    flex: 1
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPercentage(10),
  },
  sortBtn: {
    paddingHorizontal: widthPercentage(4),
    paddingVertical: 4,
  },
  sortText: {
    fontSize: fontPercentage(13),
    fontFamily: 'Pretendard-Medium',
    color: colors.textSecondary,
  },
  viewSeg: {
    flexDirection: 'row',
    backgroundColor: colors.bgMuted,
    borderRadius: 8,
    padding: 2,
  },
  viewSegBtn: {
    paddingHorizontal: widthPercentage(8),
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewSegBtnActive: {
    backgroundColor: colors.bg,
  },
  viewSegGlyph: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(14),
    color: colors.textTertiary,
  },
  viewSegGlyphActive: {
    color: colors.text,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: heightPercentage(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: widthPercentage(10),
  },
  compactBadge: {
    fontSize: fontPercentage(12),
    fontFamily: 'Pretendard-SemiBold',
    color: colors.textTertiary,
    width: widthPercentage(48),
  },
  compactBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPercentage(8),
  },
  compactTitle: {
    flexShrink: 1,
    fontSize: fontPercentage(15),
    fontFamily: 'Pretendard-Regular',
    color: colors.text,
  },
  compactCategory: {
    fontSize: fontPercentage(11),
    fontFamily: 'Pretendard-Medium',
    color: colors.textTertiary,
    backgroundColor: colors.bgMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  compactChevron: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(18),
    color: colors.textTertiary,
  },
  categoryBar: {
    backgroundColor: colors.bg,
  },
  categoryBarContent: {
    paddingHorizontal: widthPercentage(16),
    paddingVertical: heightPercentage(4),
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.bgMuted,
  },
  categoryChipActive: {
    backgroundColor: colors.bgInverse,
  },
  categoryLabel: {
    fontSize: fontPercentage(14),
    fontFamily: 'Pretendard-Medium',
    color: colors.textSecondary,
  },
  categoryLabelActive: {
    color: colors.textInverse,
  },

  listRoot: {
    marginHorizontal: widthPercentage(20),
    marginTop: heightPercentage(16),
  },

  listItem: {
    position: 'relative',
    marginBottom: heightPercentage(16),
    borderRadius: 8,
  },
  listImage: {
    width: '100%',
    height: heightPercentage(436),
    borderRadius: 8,
  },
  // 사진 하단을 살짝 눌러 흰 글씨의 대비를 확보한다.
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: heightPercentage(140),
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  scrimGrid: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  bottomTextContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
  },
  tagContainer: {
    minWidth: widthPercentage(40),
    height: heightPercentage(20),
    backgroundColor: '#FFFFFF33',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },

  listBadge: {
    color: '#FFFFFF',
    fontSize: fontPercentage(12),
    fontFamily: fonts.medium,
  },
  listText: {
    color: '#FFFFFF',
    fontSize: fontPercentage(22),
    fontFamily: fonts.medium,
    marginTop: heightPercentage(10),
  },
  // 그리드 UI
  gridItem: {
    position: 'relative',
    marginBottom: heightPercentage(16),
    borderRadius: 8,
    width: '48%',
  },
  gridImage: {
    width: '100%',
    height: 212,
    borderRadius: 8,
  },
  bottomGrideTextContainer: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 16,
  },
  tagGridContainer: {
    minWidth: widthPercentage(40),
    height: heightPercentage(16),
    backgroundColor: '#FFFFFF33',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  listGridBadge: {
    color: '#FFFFFF',
    fontSize: fontPercentage(10),
    fontFamily: fonts.medium,
  },
  listGridText: {
    color: '#FFFFFF',
    fontSize: fontPercentage(14),
    fontFamily: fonts.semibold,
    marginTop: heightPercentage(6),
  },



});

export default GuideScreen;
