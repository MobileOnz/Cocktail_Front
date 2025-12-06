import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
  ScrollView,
  FlatList
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigation/Navigation';
import { widthPercentage, heightPercentage, fontPercentage, getResponsiveHeight } from '../../assets/styles/FigmaScreen';

type GuideSreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'GuideScreen'
>;

interface Props {
  navigation: GuideSreenNavigationProp;
}

const GuideScreen: React.FC<Props> = ({ navigation }) => {
  const [viewType, setviewType] = useState(0)  
  const [images, setImages] = useState([]);     // 서버에서 받아온 이미지
  const [loading, setLoading] = useState(false); // 로딩 상태

  // 테스트 이미지
  const testImages = [
    { id: 1, src: require('../../assets/drawable/testGuide.jpg'), title: '칵테일이란' },
    { id: 2, src: require('../../assets/drawable/testGuide.jpg'), title: '칵테일이란' },
    { id: 3, src: require('../../assets/drawable/testGuide.jpg'), title: '칵테일이란' },
    { id: 4, src: require('../../assets/drawable/testGuide.jpg'), title: '칵테일이란' },
    { id: 5, src: require('../../assets/drawable/testGuide.jpg'), title: '칵테일이란' },
    { id: 6, src: require('../../assets/drawable/testGuide.jpg'), title: '칵테일이란' },
    { id: 7, src: require('../../assets/drawable/testGuide.jpg'), title: '칵테일이란' },
    { id: 8, src: require('../../assets/drawable/testGuide.jpg'), title: '칵테일이란' },
    { id: 9, src: require('../../assets/drawable/testGuide.jpg'), title: '칵테일이란' },
    { id: 10, src: require('../../assets/drawable/testGuide.jpg'), title: '칵테일이란' },
  ];

  const handleViewType = () => {
    setviewType(viewType === 0 ? 1 : 0);
  }
  console.log(viewType)
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
            <ListView images={testImages} navigation={navigation} />
          ) : (
            <GridView images={testImages} navigation={navigation} />
          )
        )}
      </View>



      
    </View>
  );

}

const ListView = ({ images, navigation }) => {
  

  return (
    <ScrollView style={styles.listRoot}>
      {images.map(item => (
        <TouchableOpacity key={item.id} style={styles.listItem}
          onPress={() => navigation.navigate('GuideDetailScreen', {id: item.id, src: item.src, title: item.title})}
        >
          <Image source={item.src} style={styles.listImage} />

          <View style={styles.bottomTextContainer}>
              <View style={styles.tagContainer}>
                <Text style={styles.listBadge}>Part.{item.id}</Text>
              </View>
              <Text style={styles.listText}>{item.title}</Text>
          </View>
        </TouchableOpacity>  
      ))}
    </ScrollView>
  );
};

const GridView = ({ images, navigation }) => {
  return (
    <FlatList
      data={images}
      numColumns={2}
      style={styles.listRoot}
      key={"grid"}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      renderItem={({ item }) => (
        
        <TouchableOpacity key={item.id} style={styles.gridItem}
          onPress={() => navigation.navigate('GuideDetailScreen', {id: item.id, src: item.src, title: item.title})}
        >
            <Image source={item.src} style={styles.gridImage} />

            <View style={styles.bottomGrideTextContainer}>
                <View style={styles.tagGridContainer}>
                  <Text style={styles.listGridBadge}>Part.{item.id}</Text>
                </View>
                <Text style={styles.listGridText}>{item.title}</Text>
            </View>
        </TouchableOpacity>
      )}
      keyExtractor={item => item.id.toString()}
    />
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#fffcf3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: heightPercentage(14),
    paddingLeft: widthPercentage(16),
    paddingRight: widthPercentage(16),
    paddingBottom: heightPercentage(10),
    backgroundColor: '#ff0000ff'
  },
  headerTitle: {
    fontSize: fontPercentage(20),
    color: '#1B1B1B',
    fontWeight: '600'
  },
  icon: {
    width: widthPercentage(24),
    height: widthPercentage(24),
    resizeMode: 'contain',
  },
  centralContainer: {
    flex: 1,
    marginBottom: heightPercentage(100)
  },

  listRoot: {
    marginHorizontal: widthPercentage(24), 
    marginTop: heightPercentage(16)
  },
  listItem: {
    position: 'relative',
    marginBottom: heightPercentage(16),
    borderRadius: 8
  },
  listImage: {
    width: '100%',
    borderRadius: 8,
    resizeMode: 'cover'
  },

  bottomTextContainer: {
    position: "absolute",
    left: 16,
    bottom: 24,
  },
  tagContainer: {
    width: widthPercentage(48),
    height: heightPercentage(20),
    backgroundColor: "#FFFFFF33",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 16,   // 높이보다 충분히 크게 주면 완전 둥근 원
  },
  
  listBadge: {
    color: '#ffffffff',
    fontSize: fontPercentage(12),
    fontWeight: '500'
  },
  listText: {
    color: '#ffffffff',
    fontSize: fontPercentage(22),
    fontWeight: '600',
    marginTop: heightPercentage(10)
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
    resizeMode: 'cover'
  },
  bottomGrideTextContainer: {
    position: "absolute",
    left: 8,
    bottom: 16,
  },
  tagGridContainer: {
    width: widthPercentage(40),
    height: heightPercentage(16),
    backgroundColor: "#FFFFFF33",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 16,   // 높이보다 충분히 크게 주면 완전 둥근 원
  },
  listGridBadge: {
    color: '#ffffffff',
    fontSize: fontPercentage(10),
    fontWeight: '500'
  },
  listGridText: {
    color: '#ffffffff',
    fontSize: fontPercentage(14),
    fontWeight: '600',
    marginTop: heightPercentage(6)
  },



})

export default GuideScreen