import React from 'react';
import Svg, {
  Defs,
  Mask,
  Rect,
  Circle,
  Image as SvgImage,
} from 'react-native-svg';

type Props = {
  source: any;     
  width: number;
  height: number;
  radius?: number;  // 카드 모서리 둥글기
  biteR?: number;   // 파먹는 원 반지름
  biteCx?: number;  // 파먹는 원 중심 X
  biteCy?: number;  // 파먹는 원 중심 Y
};

export default function CurvedImage({
  source,
  width,
  height,
  radius = 20,
  biteR = 18,
  biteCx = 26,
  biteCy = 26,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <Mask id="imgMask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
          {/* 흰색 = 보임, 검정 = 숨김 */}
          <Rect x={0} y={0} width={width} height={height} rx={radius} ry={radius} fill="white" />
          <Circle cx={biteCx} cy={biteCy} r={biteR} fill="black" />
        </Mask>
      </Defs>

      <SvgImage
        width={width}
        height={height}
        href={source}                         // require(...) 그대로 OK
        preserveAspectRatio="xMidYMid slice" // 필요에 따라 'none'/'meet'로 조절 가능
        mask="url(#imgMask)"
      />
    </Svg>
  );
}
