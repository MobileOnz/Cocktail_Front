import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigation/Navigation';
import { widthPercentage, heightPercentage, fontPercentage } from '../../assets/styles/FigmaScreen';
import PagerView from 'react-native-pager-view';
import GuideDetailViewModel from './GuideDetailViewModel';

type GuideDetailSreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'GuideDetailScreen'
>;

interface Props {
  navigation: GuideDetailSreenNavigationProp;
  route: any
}


const GuideDetailScreen: React.FC<Props> = ({ navigation, route}) => {
    const {id, title } = route.params
    const [ currentPage, setCurrentPage] = useState(0)
    const { getGuideDetail, guideDetail, loading, stay3sViewGuideDetail } = GuideDetailViewModel()

    // 공유
    const handleSharePress = () => {
        
    }

    useEffect(() => {
      getGuideDetail(id)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
      if (!guideDetail) return;

      const timer = setTimeout(() => {
        stay3sViewGuideDetail(guideDetail)
      }, 5000);

      // 화면 나가면 타이머 제거
      return () => {
        clearTimeout(timer);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [guideDetail]);

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

    return (
        <View style={styles.rootContainer}>
            {/* 상단 뷰 */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={ () => {
                        navigation.goBack()
                    }}
                >
                    <Image
                        source={require('../../assets/drawable/left-chevron.png')}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>    
                <TouchableOpacity
                    onPress={handleSharePress}
                >
                    <Image
                        source={require('../../assets/drawable/share.png')}
                        style={styles.icon}
                    />
                </TouchableOpacity>
            </View>
            
            <PagerView
                style = { styles.centralContainer }
                initialPage={0}
                orientation={'horizontal'}
                onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
            >
                {guideDetail?.details.map((page, index) => (
                    <View key={index}>
                        <Image
                            source={{ uri: page.imageUrl }}
                            style={styles.itemImage}
                        />
                        <View 
                            style={{
                                paddingHorizontal: widthPercentage(16),
                                paddingTop: heightPercentage(20)
                            }}
                        >
                            <Text style={styles.titleText}>{page.subtitle}</Text>
                            <Text style={styles.subText}>{page.description}</Text>
                        </View>
                    </View>
                ))}
            </PagerView>
            {/* 하단 인디케이터 */}
            <View style={styles.indicatorContainer}>
                {guideDetail?.details.map((_, idx) => (
                    <View
                        key={idx}
                        style={[
                            styles.indicator,
                            currentPage === idx && styles.indicatorActive
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

export default GuideDetailScreen

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
  },
  itemImage: {
    width: '100%',
    height: '65%',
    resizeMode: 'cover'
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: '#ffffffff'
  },
  titleText: {
    fontSize: fontPercentage(20),
    color: '#1B1B1B',
    fontWeight: '600',
  },
  subText: {
    marginTop: heightPercentage(8),
    fontSize: fontPercentage(16),
    color: '#616161',
    fontWeight: '500'
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: heightPercentage(32)
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 50,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 5
  },
  indicatorActive: {
    backgroundColor: '#AAAAAA',
    width: 8,
    height: 8
  }
})