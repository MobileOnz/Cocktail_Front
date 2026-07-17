import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
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
  const [viewType, setviewType] = useState(0);   // 보기 방식
  const { guideList, getGuideList, loading } = GuideDetailViewModel();

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

  const handleViewType = () => {
    setviewType(viewType === 0 ? 1 : 0);
  };

  const Root: React.ComponentType<any> = embedded ? View : SafeAreaView;

  return (
    <Root style={styles.rootContainer}>
      {/* 상단 뷰 — embedded 일 때는 제목을 부모(RecipeBookScreen)가 그리므로 보기전환 버튼만 남긴다 */}
      <View style={[styles.header, embedded && styles.headerEmbedded]}>

        {!embedded && <Text style={styles.headerTitle}>칵테일 가이드</Text>}

        <TouchableOpacity
          onPress={handleViewType}
          accessibilityRole="button"
          accessibilityLabel={viewType === 0 ? '그리드 보기로 전환' : '리스트 보기로 전환'}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {viewType === 0 ? (
          <Image
            source={require('../../assets/drawable/viewMenu.png')}
            style={styles.icon}
          />
        ) : (
          <Image
            source={require('../../assets/drawable/gridType.png')}
            style={styles.icon}
          />
        )}
        </TouchableOpacity>
      </View>

      <View style={styles.centralContainer}>
        {!loading && (
          viewType === 0 ? (
            <ListView data={guideList} navigation={navigation} />
          ) : (
            <GridView data={guideList} navigation={navigation} />
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
          onPress={() => navigation.navigate('GuideDetailScreen', {id: item.part, src: item.imageUrl, title: item.title})}
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
          onPress={() => navigation.navigate('GuideDetailScreen', {id: item.part, src: item.imageUrl, title: item.title})}
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
    fontWeight: '600',
  },
  icon: {
    width: widthPercentage(24),
    height: widthPercentage(24),
    resizeMode: 'contain',
  },
  centralContainer: {
    flex: 1
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
    fontWeight: '500',
  },
  listText: {
    color: '#FFFFFF',
    fontSize: fontPercentage(22),
    fontWeight: '600',
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
    fontWeight: '500',
  },
  listGridText: {
    color: '#FFFFFF',
    fontSize: fontPercentage(14),
    fontWeight: '600',
    marginTop: heightPercentage(6),
  },



});

export default GuideScreen;
