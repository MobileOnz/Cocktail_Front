import React from 'react';
import Svg, { Path, Defs, Mask, Image as SvgImage } from 'react-native-svg';

type Props = {
  source: any;
  size?: number;
  toothR?: number; // 퍼즐 돌기 반지름
};

export default function PuzzlePiece({ source, size = 200 }: Props) {
  const w = size;
  const h = size;

  const puzzlePath = `
    M0,0
    V120
    Q0,140 30,140
    C60,140 50,170, 50,180
    C50,190 60,210, 80,210
    H200
    V0
    Z
  `;

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Defs>
        <Mask id="puzzleMask" maskUnits="userSpaceOnUse">
          <Path d={puzzlePath} fill="white" />
        </Mask>
      </Defs>

      <SvgImage
        width={w}
        height={h}
        href={source}
        preserveAspectRatio="xMidYMid slice"
        mask="url(#puzzleMask)"
      />
    </Svg>
  );
}
