import React from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Appbar, Button, overlay, Text } from 'react-native-paper';
import theme from '../../assets/styles/theme';
import { heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import CurvedImage from '../../configs/CurvedImage';

const Maps = () => {
  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <Appbar.Header style={styles.header}>
        {/* 왼쪽 로고 */}
        <Image
          source={require('../../assets/drawable/banner.jpg')}
          style={{ width: widthPercentage(120), height: heightPercentage(40) }}
          resizeMode="contain"
        />

        {/* 가운데 공백 */}
        <Appbar.Content title="" />

        {/* 오른쪽 아이콘 */}
        <Appbar.Action icon="magnify" onPress={() => { }} />
        <Appbar.Action icon="bookmark-outline" onPress={() => { }} />
      </Appbar.Header>


      {/* 필터 영역 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterView}
      >
        {['최신순', '도수', '스타일', '맛', '베이스'].map((label, idx) => (
          <Button
            key={idx}
            mode="outlined"
            icon={label === '최신순' ? undefined : 'chevron-down'}
            compact
            contentStyle={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row-reverse',
              height: 30,
              paddingHorizontal: 10,

            }}
            style={[styles.chip, styles.chipUnselected]}
            labelStyle={[styles.chipLabel]}
          >
            {label}
          </Button>
        ))}
      </ScrollView>
      {/* 컨텐츠 뷰 */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.allScrollView}>

        {/* 메인 사진 */}
        <Image source={require('../../assets/textImage/main_test.png')} style={{ width: 375, height: 457 }} />

        {/* Best 입문자용 칵테일 */}
        <View style={{ alignItems: 'flex-start' }}>
          <Text variant='bodyLarge' style={{ fontWeight: '700' }}>Best 입문자용 칵테일</Text>
          <ScrollView
            horizontal>
            <View style={styles.card}>
              <CurvedImage
                source={require('../../assets/textImage/main_test.png')}
                width={widthPercentage(160)}
                height={heightPercentage(120)}
                radius={20}         // 카드 전체 모서리 둥글기
                biteR={16}          // 파먹는 정도
                biteCx={28}         // 파먹는 위치 X (좌상단 기준)
                biteCy={28}         // 파먹는 위치 Y
              />
              <View style={styles.overlay}>
                <Text style={{ backgroundColor: theme.background }}>1</Text>
                <Text>피나 콜라다</Text>
              </View>

            </View>
          </ScrollView>
        </View>



      </ScrollView>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    backgroundColor: theme.background,
    paddingHorizontal: 8,
  },
  filterView: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: widthPercentage(8),
    paddingVertical: heightPercentage(6),
    gap: 8,
  },
  allScrollView: {
    marginTop: heightPercentage(10),
    paddingHorizontal: widthPercentage(10),
    paddingVertical: heightPercentage(10),

  },
  chip: {
    borderRadius: 100,
    borderWidth: 1,
    minHeight: 0,
    marginBottom: heightPercentage(10),
  },
  chipUnselected: {
    backgroundColor: theme.background,
    borderColor: '#E0E0E0',
  },

  chipLabel: {
    fontSize: 10,
    lineHeight: 11,
    color: '#333333',
  },

  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  card: {
    width: widthPercentage(140),
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: widthPercentage(10),
  },
  bestImage: {
    width: 'auto',
    height: heightPercentage(100),
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  overlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',

  }
});

export default Maps;
