import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fontPercentage, heightPercentage, widthPercentage } from '../assets/styles/FigmaScreen';

export type PillStyleProps = {
  tone: string;
};
const TONE_COLOR_KEY: Record<string, string> = {
  라이트: 'light',
  스탠다드: 'standard',
  스페셜: 'special',
  스트롱: 'strong',
  클래식: 'classic',
};

const TONE_BG: Record<string, string> = {
  light: '#B89359',
  standard: '#D3A090',
  special: '#7F8B79',
  strong: '#9C8086',
  classic: '#7A624E',
};

export default function PillStyleStatus({
  tone = '스탠다드',

}: PillStyleProps) {
  const colorKey = TONE_COLOR_KEY[tone] ?? 'standard';

  return (
    <View style={[styles.base, { backgroundColor: TONE_BG[colorKey] }]}>
      <Text style={styles.label}>{tone}</Text>
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
