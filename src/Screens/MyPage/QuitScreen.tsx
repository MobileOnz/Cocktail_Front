
import { useNavigation } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text
} from 'react-native';
import { widthPercentage, heightPercentage, fontPercentage } from '../../assets/styles/FigmaScreen';

const QuitScreen: React.FC = () => {
  const navigation = useNavigation();
  
  const quitSubTitle = [
    {
        id: 1,
        text: '탈퇴 시 모든 정보는 즉시 삭제돼요.'
    },
    {
        id: 2,
        text: '삭제된 데이터는 복구할 수 없어요.',
    },
    {
        id: 3,
        text: '탈퇴 후 24시간 동안 재가입이 제한됩니다.'
    },
  ]

  return (
    <View style={styles.container}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image source={require('../../assets/drawable/left-chevron.png')} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>회원탈퇴</Text>
            <View style={styles.backIcon} />
        </View>
        
        <View style={styles.contentContainer}>
            <Text style={styles.quitTitle}>정말 떠나시겠어요?</Text>
            <Text style={styles.subTitle}>함께한 시간, 즐거웠어요.</Text>
            <Text style={styles.subTitle}>탈퇴 전 아래 내용을 꼭 확인해주세요.</Text>

            <View style={styles.quitClueContainer}>
                <Text style={styles.quitClueTitle}>회원 탈퇴 시 유의사항 안내</Text>
                
                {quitSubTitle.map(item => (
                    <Text key={item.id} style={styles.quitClueSubTitle}>
                        {item.id}. {item.text}
                    </Text>    
                ))}
                
            </View>
        </View>

        <TouchableOpacity style={styles.quitBtn}>
            <Text style={styles.quitText}>탈퇴하기</Text>   
        </TouchableOpacity>

    </View>
  );
}

export default QuitScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: heightPercentage(52),
    paddingHorizontal: widthPercentage(16),
    paddingTop: heightPercentage(14),
    paddingBottom: heightPercentage(10)

  },
  icon: {
    width: widthPercentage(24),
    height: heightPercentage(24)
  },
  headerTitle: {
    fontSize: fontPercentage(20),
    fontWeight: '600',
    color: '#1B1B1B',
  },
  backIcon: {
    width: widthPercentage(28),
    height: widthPercentage(28),
    resizeMode: 'contain',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: widthPercentage(16),
    marginBottom: heightPercentage(52),
  },
  quitTitle: {
    marginTop: heightPercentage(28),
    fontSize: fontPercentage(22),
    color: '#1B1B1B',
    fontWeight: '600',
  },
  subTitle: {
    marginTop: heightPercentage(4),
    fontSize: fontPercentage(16),
    color: '#616161',
    fontWeight: '500',
  },
  quitClueContainer: {
    backgroundColor: '#F5F5F5',
    paddingVertical: heightPercentage(12),
    paddingHorizontal: widthPercentage(16),
    marginTop: heightPercentage(20)
  }, 
  quitClueTitle: {
    fontWeight: '600',
    fontSize: fontPercentage(14),
    color: '#FF465C',
  },
  quitClueSubTitle: {
    fontWeight: '500',
    fontSize: fontPercentage(14),
    color: '#1B1B1B',
    marginTop: heightPercentage(14)
  },
  quitBtn: {
    position: 'relative',
    bottom: heightPercentage(52),
    height: heightPercentage(52),
    backgroundColor: '#FF465C',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: widthPercentage(16),
    borderRadius: 8,
    marginBottom: heightPercentage(14)
  },
  quitText: {
    fontSize: fontPercentage(16),
    fontWeight: '600',
    color: '#FFFFFF', 
  }
});