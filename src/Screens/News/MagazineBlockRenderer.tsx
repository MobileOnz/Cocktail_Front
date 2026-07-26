// MagazineBlockRenderer.tsx
// 매거진 블록 배열(content JSONB)을 렌더한다.
// 지원: paragraph(+bold marks) · heading · quote(+cite) · cocktail_spec(카드, 칵테일 링크).
// 미지원 타입은 조용히 스킵한다.
import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import { colors, fonts, fontSize, radius, spacing } from '../../lib/theme';
import type { MagazineBlock, MagazineMark, CocktailSpecRow } from '../../types/api';

type Segment = { t: string; bold: boolean };

/** marks(bold 구간)를 반영해 문자열을 세그먼트로 쪼갠다. marks 는 본문의 부분 문자열이다. */
function splitByMarks(text: string, marks?: MagazineMark[]): Segment[] {
  const bolds = (marks ?? []).filter(m => m.style === 'bold').map(m => m.text).filter(Boolean);
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
      {(blocks ?? []).map((block, i) => {
        const b = block as any;
        switch (b.type) {
          case 'paragraph': {
            const segments = splitByMarks(String(b.text ?? ''), b.marks);
            return (
              <Text key={i} style={styles.paragraph}>
                {segments.map((s, j) => (
                  <Text key={j} style={s.bold ? styles.bold : undefined}>{s.t}</Text>
                ))}
              </Text>
            );
          }
          case 'heading':
            return <Text key={i} style={styles.heading}>{b.text}</Text>;
          case 'quote':
            return (
              <View key={i} style={styles.quote}>
                <Text style={styles.quoteText}>{b.text}</Text>
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
                  {!!b.name && <Text style={styles.specName}>{b.name}</Text>}
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
  paragraph: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.base),
    color: colors.text,
    lineHeight: fontPercentage(27),
    marginBottom: heightPercentage(spacing.md),
  },
  bold: { fontFamily: fonts.bold },
  heading: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(fontSize.lg),
    color: colors.text,
    lineHeight: fontPercentage(28),
    marginTop: heightPercentage(spacing.lg),
    marginBottom: heightPercentage(spacing.sm),
  },
  quote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingLeft: widthPercentage(spacing.md),
    marginVertical: heightPercentage(spacing.md),
  },
  quoteText: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.md),
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: fontPercentage(25),
  },
  quoteCite: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.textTertiary,
    marginTop: heightPercentage(spacing.xs),
  },
  specCard: {
    backgroundColor: colors.bgSubtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginVertical: heightPercentage(spacing.md),
  },
  specImage: { width: '100%', height: heightPercentage(160), backgroundColor: colors.skeleton },
  specBody: { padding: widthPercentage(spacing.lg) },
  specName: { fontFamily: fonts.bold, fontSize: fontPercentage(fontSize.lg), color: colors.text },
  specNameEn: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.textTertiary,
    marginBottom: heightPercentage(spacing.sm),
  },
  specRows: { marginTop: heightPercentage(spacing.xs) },
  specRow: { flexDirection: 'row', marginTop: heightPercentage(spacing.xs) },
  specKey: {
    width: widthPercentage(72),
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.textTertiary,
  },
  specVal: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.text,
  },
  specLink: {
    marginTop: heightPercentage(spacing.md),
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(fontSize.sm),
    color: colors.accent,
  },
});
