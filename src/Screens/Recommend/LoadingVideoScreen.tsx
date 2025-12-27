import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Video from 'react-native-video';
import { RootStackParamList } from '../../Navigation/Navigation';
import VideoViewModel from './VideoViewModel';
import {fontPercentage } from '../../assets/styles/FigmaScreen'; 
import { useToast } from '../../Components/ToastContext';

type RecommendationLoadingVideoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'LoadingVideoScreen'
>;

interface Props {
  navigation: RecommendationLoadingVideoScreenNavigationProp;
  route: any
}

const texts = [
  '당신의 취향에 딱 맞는\n칵테일을 준비하고 있어요.',
  '새로운 발견을 건네줄\n칵테일을 준비하고 있어요.',
  '오늘 기분에 어울리는\n칵테일을 준비하고 있어요.',
];

const LoadingVideoScreen: React.FC<Props> = ({navigation, route}) => {
    const { answers } = route.params;
    const { textIdx, setTextIdx, recommend } = VideoViewModel()
    const {showToast} = useToast();
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const translateY = useRef(new Animated.Value(0)).current;



    useEffect(() => {
        const interval = setInterval(() => {
        // 사라짐
        Animated.parallel([
            Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            }),
            Animated.timing(translateY, {
            toValue: -10,
            duration: 300,
            useNativeDriver: true,
            }),
        ]).start(() => {
            // 텍스트 변경
            setTextIdx((prev) => (prev + 1) % texts.length);

            // 다시 등장
            translateY.setValue(10);
            Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            ]).start();
        });
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    useEffect( () => {
        const run = async() => {
            const result = await recommend(answers);
            if (!result) {
              setTimeout( () => {
                showToast("칵테일 추천에 실패했어요")
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'BottomTabNavigator',
                      params: {
                        screen: '홈',
                      },
                    },
                  ],
                });
              }, 4500);
              return
            } else {
              setTimeout( () => {
                  navigation.navigate('RecommendResultScreen', { result })
              }, 4500);
            }
        };
        run();
    }, [])
    
    return (
        <View style={styles.container}>
            <Video
                source={require('../../assets/video/recommend.mp4')}
                style={styles.video}
                resizeMode="cover"

            />

            <View style={styles.overlay}>
                <Animated.Text
                style={[
                    styles.title,
                    {
                    opacity: fadeAnim,
                    transform: [{ translateY }],
                    },
                ]}
                >
                {texts[textIdx]}
                </Animated.Text>
            </View>
        </View>
    );
};

export default LoadingVideoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 112,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  title: {
    fontSize: fontPercentage(22),
    fontWeight: '600',
    color: 'white',
    textAlign: 'center'
  },
});