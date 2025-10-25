import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { fontPercentage, heightPercentage, widthPercentage } from '../assets/styles/FigmaScreen';

export type PillStyleProps = {
  tone: string;
};
const TONE_TEXT: Record<string, string> = {
  light: '라이트',
  standard: '스탠다드',
  special: '스페셜',
  strong: '스트롱',
  classic: '클래식',
};


const TONE_BG: Record<string, string> = {
  light:   '#B89359',
  standard:'#D3A090',
  special: '#7F8B79',
  strong:  '#9C8086',
  classic: '#7A624E',
};

export default function PillStyleStatus({
  tone = 'standard',
  
}: PillStyleProps) {
  return (
    <View style={[styles.base, { backgroundColor: TONE_BG[tone] }]}>
      <Text style={styles.label}>{TONE_TEXT[tone]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingHorizontal: widthPercentage(8),
    paddingVertical: heightPercentage(5),
    alignSelf: 'flex-start',
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontPercentage(12),
    letterSpacing: 1,
  },
});
