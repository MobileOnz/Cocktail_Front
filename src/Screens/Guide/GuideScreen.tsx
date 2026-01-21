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
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigation/Navigation';
import { widthPercentage, heightPercentage, fontPercentage } from '../../assets/styles/FigmaScreen';
import GuideDetailViewModel from './GuideDetailViewModel';
import { GuideSummary } from '../../model/domain/GuideSummary';

type GuideSreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'GuideScreen'
>;

interface Props {
  navigation: GuideSreenNavigationProp;
}

const GuideScreen: React.FC<Props> = ({ navigation }) => {
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

  return (
    <View style={styles.rootContainer}>
      {/* 상단 뷰 */}
      <View style={styles.header}>

        <Text style={styles.headerTitle}>콘텐츠</Text>

        <TouchableOpacity
          onPress={handleViewType}
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
    </View>
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
          <Image source={{ uri: item.imageUrl}} style={styles.listImage} />

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
            <Image source={{ uri: item.imageUrl}} style={styles.gridImage} />

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
    resizeMode: 'cover',
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
    color: '#ffffffff',
    fontSize: fontPercentage(12),
    fontWeight: '500',
  },
  listText: {
    color: '#ffffffff',
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
    resizeMode: 'cover',
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
    color: '#ffffffff',
    fontSize: fontPercentage(10),
    fontWeight: '500',
  },
  listGridText: {
    color: '#ffffffff',
    fontSize: fontPercentage(14),
    fontWeight: '600',
    marginTop: heightPercentage(6),
  },



});

export default GuideScreen;
