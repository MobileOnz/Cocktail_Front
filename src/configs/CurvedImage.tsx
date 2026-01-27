import React from 'react';
import { Image, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path } from 'react-native-svg';

type Props = {
  uri: string;
  size?: number;
};

export default function PuzzlePiece({ uri, size = 200 }: Props) {
  const baseWidth = 200;
  const baseHeight = 210;

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
    <View style={{ width: size, height: size, overflow: 'hidden' }}>
      <MaskedView
        style={{ flex: 1 }}
        maskElement={
          <Svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${baseWidth} ${baseHeight}`}
            preserveAspectRatio="xMidYMid slice"
          >
            <Path d={puzzlePath} fill="black" />
          </Svg>
        }
      >
        <Image
          source={{ uri }}
          style={{
            width: '100%',
            height: '120%',
            position: 'absolute',
            top: '-5%',
            left: '-10%',
          }}
          resizeMode="contain"

        />
      </MaskedView>
    </View>
  );
}