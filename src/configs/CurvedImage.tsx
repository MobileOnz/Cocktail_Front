import React from 'react';
import { Image, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  uri: string;
  size?: number;
};

export default function PuzzlePiece({ uri, size = 200 }: Props) {
  const w = size;
  const h = size;

  const puzzlePath = `
    M0,0
    V120
    Q0,140 30,140
    C60,140 50,170 50,180
    C50,190 60,210 80,210
    H200
    V0
    Z
  `;

  return (
    <MaskedView
      style={{
        width: w,
        height: h,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      }}
      maskElement={
        <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <Path d={puzzlePath} fill="black" />
        </Svg>
      }
    >

      <Image
        source={{ uri }}
        style={{ width: w, height: h }}
        resizeMode="cover"
      />


      <LinearGradient

        colors={['transparent', 'rgba(0,0,0,0.0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.85)']}

        locations={[0, 0.7, 0.85, 1]}
        style={StyleSheet.absoluteFill}
      />
    </MaskedView>
  );
}
