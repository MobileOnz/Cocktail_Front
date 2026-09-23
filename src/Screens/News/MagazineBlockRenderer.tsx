// MagazineBlockRenderer.tsx
// 매거진 블록 배열(content JSONB)을 렌더한다.
// 지원: paragraph(+bold marks) · heading · quote(+cite) · cocktail_spec(카드, 칵테일 링크).
// 미지원 타입은 조용히 스킵한다.
import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import {fonts, fontSize, koreanBreak, radius, spacing, night} from '../../lib/theme';
import type { MagazineBlock, MagazineMark, CocktailSpecRow } from '../../types/api';

type Segment = { t: string; bold: boolean };

/** marks(bold 구간)를 반영해 문자열을 세그먼트로 쪼갠다. marks 는 본문의 부분 문자열이다. */
function splitByMarks(text: string, marks?: MagazineMark[]): Segment[] {
  // content 는 서버가 JSONB 원본을 그대로 흘려보내는 값이라(@JsonRawValue) 스키마 보장이 없다.
  // marks 가 배열이 아니면 `?? []` 로는 못 막고 .filter 에서 throw → 루트 ErrorBoundary 가
  // 앱 전체를 리셋한다. 기사 하나의 데이터 오류로 앱이 죽으면 안 된다.
  const bolds = (Array.isArray(marks) ? marks : [])
    .filter(m => m && m.style === 'bold')
    .map(m => m.text)
    .filter((t): t is string => typeof t === 'string' && t.length > 0);
  if (bolds.length === 0) { return [{ t: text, bold: false }]; }
  let segments: Segment[] = [{ t: text, bold: false }];
  for (const b of bolds) {
    const next: Segment[] = [];
    for (const seg of segments) {
      if (seg.bold) { next.push(seg); continue; }
      const idx = seg.t.indexOf(b);
      if (idx === -1) { next.push(seg); continue; }
      if (idx > 0) { next.push({ t: seg.t.slice(0, idx), bold: false }); }
      next.push({ t: b, bold: true });
      const rest = seg.t.slice(idx + b.length);
      if (rest) { next.push({ t: rest, bold: false }); }
    }
    segments = next;
  }
  return segments;
}

type Props = {
  blocks: MagazineBlock[];
  onCocktailPress?: (cocktailId: number) => void;
};

const MagazineBlockRenderer = ({ blocks, onCocktailPress }: Props) => {
  return (
    <View>
      {(Array.isArray(blocks) ? blocks : []).map((block, i) => {
        const b = block as any;
        switch (b.type) {
          case 'paragraph': {
            const segments = splitByMarks(typeof b.text === 'string' ? b.text : String(b.text ?? ''), b.marks);
            return (
              <Text key={i} style={styles.paragraph} {...koreanBreak}>
                {segments.map((s, j) => (
                  <Text key={j} style={s.bold ? styles.bold : undefined}>{s.t}</Text>
                ))}
              </Text>
            );
          }
          case 'heading':
            // 보조기술이 기사 목차를 읽으려면 헤더로 노출돼야 한다.
            return (
              <Text key={i} style={styles.heading} accessibilityRole="header" {...koreanBreak}>
                {b.text}
              </Text>
            );
          case 'image':
            return b.src ? (
              <View key={i}>
                <Image source={{ uri: b.src }} style={styles.blockImage} resizeMode="cover" />
                {!!b.caption && <Text style={styles.blockImageCaption}>{b.caption}</Text>}
              </View>
            ) : null;
          case 'quote':
            return (
              <View key={i} style={styles.quote}>
                <Text style={styles.quoteText} {...koreanBreak}>{b.text}</Text>
                {!!b.cite && <Text style={styles.quoteCite}>— {b.cite}</Text>}
              </View>
            );
          case 'cocktail_spec': {
            const specs: CocktailSpecRow[] = Array.isArray(b.specs) ? b.specs : [];
            const cocktailId: number | null = typeof b.cocktail_id === 'number' ? b.cocktail_id : null;
            const inner = (
              <View style={styles.specCard}>
                {!!b.image && <Image source={{ uri: b.image }} style={styles.specImage} resizeMode="cover" />}
                <View style={styles.specBody}>
                  {!!b.name && <Text style={styles.specName} {...koreanBreak}>{b.name}</Text>}
                  {!!b.name_en && <Text style={styles.specNameEn}>{b.name_en}</Text>}
                  <View style={styles.specRows}>
                    {specs.map((row, k) => (
                      <View key={k} style={styles.specRow}>
                        <Text style={styles.specKey}>{row.k}</Text>
                        <Text style={styles.specVal}>{row.v}</Text>
                      </View>
                    ))}
                  </View>
                  {cocktailId != null && <Text style={styles.specLink}>이 칵테일 자세히 보기 ›</Text>}
                </View>
              </View>
            );
            return cocktailId != null && onCocktailPress ? (
              <Pressable key={i} onPress={() => onCocktailPress(cocktailId)} accessibilityRole="button">
                {inner}
              </Pressable>
            ) : (
              <View key={i}>{inner}</View>
            );
          }
          default:
            return null; // 미지원 블록 스킵
        }
      })}
    </View>
  );
};

export default MagazineBlockRenderer;

const styles = StyleSheet.create({
  // 매거진 본문은 UI 스케일(fontSize.*)이 아니라 '읽기' 스케일을 쓴다.
  // 15px/27 은 목록·라벨엔 맞지만 장문에서는 작고 빽빽해 가독성이 떨어진다는 QA 지적.
  paragraph: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(17),
    color: night.text,
    lineHeight: fontPercentage(30), // 1.76배
    letterSpacing: -0.3, // Pretendard 한글은 살짝 좁혀야 덩어리로 읽힌다
    marginBottom: heightPercentage(18), // 문단 사이를 행간보다 확실히 크게
  },
  bold: { fontFamily: fonts.bold },
  blockImage: {
    width: '100%',
    height: heightPercentage(200),
    borderRadius: radius.md,
    backgroundColor: night.surfaceHigh,
    marginVertical: heightPercentage(spacing.md),
  },
  blockImageCaption: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.xs),
    color: night.textFaint,
    marginTop: -heightPercentage(spacing.xs),
    marginBottom: heightPercentage(spacing.md),
  },
  // 위계: 기사 제목 28 / 소제목 20 / 본문 17.
  // 한때 소제목이 22 였는데 제목 24 와 2pt 차이라 둘이 같은 급으로 읽혔다.
  // 본문과는 3pt + Bold + 위 여백으로 충분히 갈린다.
  heading: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(fontSize.xl),
    color: night.text,
    lineHeight: fontPercentage(29),
    letterSpacing: -0.4,
    marginTop: heightPercentage(spacing.xxl),
    marginBottom: heightPercentage(spacing.sm),
  },
  quote: {
    borderLeftWidth: 3,
    borderLeftColor: night.accent,
    paddingLeft: widthPercentage(spacing.md),
    marginVertical: heightPercentage(spacing.md),
  },
  quoteText: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.md),
    color: night.textDim,
    lineHeight: fontPercentage(28),
    letterSpacing: -0.3,
  },
  quoteCite: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.sm),
    color: night.textFaint,
    marginTop: heightPercentage(spacing.xs),
  },
  // 밝은 배경에서는 카드와 바탕의 명도차가 거의 없어 선이 필요했다.
  // 검은 바탕에서는 표면색만으로 경계가 읽히므로 선을 뺀다.
  specCard: {
    backgroundColor: night.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginVertical: heightPercentage(spacing.md),
  },
  specImage: { width: '100%', height: heightPercentage(160), backgroundColor: night.surfaceHigh },
  specBody: { padding: widthPercentage(spacing.lg) },
  specName: { fontFamily: fonts.bold, fontSize: fontPercentage(fontSize.lg), color: night.text },
  specNameEn: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.sm),
    color: night.textFaint,
    marginBottom: heightPercentage(spacing.sm),
  },
  specRows: { marginTop: heightPercentage(spacing.xs) },
  specRow: { flexDirection: 'row', marginTop: heightPercentage(spacing.xs) },
  specKey: {
    width: widthPercentage(72),
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.sm),
    color: night.textFaint,
  },
  specVal: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.sm),
    color: night.text,
  },
  specLink: {
    marginTop: heightPercentage(spacing.md),
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.sm),
    color: night.accent,
  },
});
