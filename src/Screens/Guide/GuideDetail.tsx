import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigation/Navigation';
import { widthPercentage, heightPercentage, fontPercentage } from '../../assets/styles/FigmaScreen';
import PagerView from 'react-native-pager-view';

type GuideDetailSreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'GuideDetailScreen'
>;

interface Props {
  navigation: GuideDetailSreenNavigationProp;
  route: any
}


const GuideDetailScreen: React.FC<Props> = ({ navigation, route}) => {
    // 넘겨받을 파라미터값 (이미지ID, 이미지URL)
    const {title } = route.params
    // const [guides, setGuides] = useState([]);     // 서버에서 받아온 가이드
    const [ currentPage, setCurrentPage] = useState(0)

    // 공유
    const handleSharePress = () => {
        
    }

    // 테스트 데이터
    const testData = [
        {
            id: 1,
            image: require('../../assets/drawable/testGuide.jpg'),
            text: '칵테일의 기본 정의',
            subText: '칵테일은 “술 + 여러 재료(믹서, 시럽, 과일 등)”을 섞어 균형 있는 맛과 향을 만드는 혼합주입니다. 무알콜 버전도 칵테일의 범주에 포함됩니다.'
        },
        {
            id: 2,
            image: require('../../assets/drawable/testGuide.jpg'),
            text: '단순한 혼합이 아니다',
            subText: '단순히 여러 재료를 섞는 것이 아니라 각 재료의 비율과 조화를 고려해서 ‘밸런스’를 잡아야 합니다. 맛이 치우치면 칵테일로서 가치가 떨어집니다.'
        },
        {
            id: 3,
            image: require('../../assets/drawable/testGuide.jpg'),
            text: '무알콜도 칵테일',
            subText: '술을 쓰지 않더라도, 여러 재료를 조합해 완성한 음료는 ‘믹스드 드링크’ 범주가 되며, 무알콜 칵테일 또는 ‘모크테일(Mocktail)’로 불립니다.'
        },
        {
            id: 4,
            image: require('../../assets/drawable/testGuide.jpg'),
            text: '칵테일’ 이름의 유래',
            subText: '여러 설 중 하나는, 옛날에 술잔을 닭 꼬리 깃털(cock’s tail)로 장식한 데서 비롯되었다는 이야기입니다. 물론 정확한 어원은 확정되지 않았지만, 이처럼 상징적인 일화가 칵테일의 매력을 더합니다.'
        },
        {
            id: 5,
            image: require('../../assets/drawable/testGuide.jpg'),
            text: '시대별 발전',
            subText: '초기에는 단순히 술과 과즙을 섞는 방식이었, 19세기 후반 인공 제빙기의 출현으로 얼음 사용이 일반화되며 오늘날의 칵테일 문화가 형성되었습니다.'
        },
        {
            id: 6,
            image: require('../../assets/drawable/testGuide.jpg'),
            text: '혼성주의 정의',
            subText: '베버리지마스터협회 정의에 따르면, 여러 양주류와 Syrup, Fruit Juice, Egg, 탄산수 등을 적절히 혼합하여 색과 향미, 맛이 조화를 이루게 만드는 것이 칵테일입니다.'
        },
        {
            id: 7,
            image: require('../../assets/drawable/testGuide.jpg'),
            text: '왜 ‘칵테일’인가?',
            subText: '칵테일은 단순한 음료를 넘어서 분위기와 감각을 포용하는 예술적 가치가 있습니다. 좋은 재료·제조법·균형이 모두 갖춰질 때 칵테일이 완성됩니다.'
        }
    ];

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
                {testData.map((page, index) => (
                    <View key={index}>
                        <Image
                            source={page.image}
                            style={styles.itemImage}
                        />
                        <View 
                            style={{
                                paddingHorizontal: widthPercentage(16),
                                paddingTop: heightPercentage(20)
                            }}
                        >
                            <Text style={styles.titleText}>{page.text}</Text>
                            <Text style={styles.subText}>{page.subText}</Text>
                        </View>
                    </View>
                ))}
            </PagerView>
            {/* 🔥 하단 인디케이터 */}
            <View style={styles.indicatorContainer}>
                {testData.map((_, idx) => (
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