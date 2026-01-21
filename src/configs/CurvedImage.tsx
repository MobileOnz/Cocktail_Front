import React from 'react';
import { Image } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path } from 'react-native-svg';

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
      style={{ width: w, height: h }}
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
    </MaskedView>
  );
}
