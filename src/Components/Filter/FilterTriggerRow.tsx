// FilterTriggerRow.tsx
//
// 칵테일 목록 위에 놓이는 필터 진입점.
//
// 이력: 원래는 '최신순 / 도수 / 스타일 / 맛 / 베이스' 칩 5개가 가로로 놓여 있었는데,
// 다섯 개가 전부 같은 시트(전체 필터)를 열었다. 즉 칩 이름이 무엇을 여는지를 속이고 있었다
// (QA 피드백: "필터링 항목 어떤 것을 확인하든 전 항목이 다 나온다").
// → 진입점을 '필터링' 하나로 합치고, 무엇이 걸려 있는지는 개수 배지로 알린다.
//
// 같은 칩 묶음이 레시피북(AllCocktailScreen)과 검색결과(SearchResultScreen)에 복붙돼 있었으므로
// 여기 한 곳에서만 그린다.
import React from 'react';
import {Pressable, StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {fonts, night, space, round} from '../../lib/theme';
import {
  DEFAULT_FILTER,
  FilterState,
} from '../BottomSheet/FilterBottomSheet/FilterBottomSheetViewModel';
import {fontPercentage} from '../../assets/styles/FigmaScreen';

/** 지금 걸려 있는 조건 개수. 정렬은 기본값(최신순)이 아닐 때만 한 개로 센다. */
export const countActiveFilters = (filter: FilterState): number =>
  (filter.sort !== DEFAULT_FILTER.sort ? 1 : 0) +
  (filter.degree ? 1 : 0) +
  (filter.style ? 1 : 0) +
  filter.taste.length +
  filter.base.length;

type Props = {
  filter: FilterState;
  /** 필터 시트 열기. */
  onPress: () => void;
  /** 조건 전부 해제. 시트 안의 선택 상태도 같이 되돌려야 한다. */
  onReset: () => void;
  style?: StyleProp<ViewStyle>;
};

const FilterTriggerRow = ({filter, onPress, onReset, style}: Props) => {
  const count = countActiveFilters(filter);
  const active = count > 0;

  return (
    <View style={[styles.row, style]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={
          active ? `필터링, 조건 ${count}개 적용됨` : '필터링'
        }
        style={({pressed}) => [
          styles.trigger,
          active ? styles.triggerActive : styles.triggerIdle,
          pressed && styles.triggerPressed,
        ]}>
        <MIcon
          name="tune-variant"
          size={16}
          color={active ? night.onAccent : night.textDim}
        />
        <Text style={[styles.label, active && styles.labelActive]}>필터링</Text>
        {active && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </Pressable>

      {active && (
        <Pressable
          onPress={onReset}
          accessibilityRole="button"
          accessibilityLabel="필터 초기화"
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          style={styles.reset}>
          <MIcon name="close" size={14} color={night.textDim} />
          <Text style={styles.resetLabel}>초기화</Text>
        </Pressable>
      )}
    </View>
  );
};

export default FilterTriggerRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.gutter,
    paddingTop: space.sm,
    paddingBottom: space.lg,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs + 2,
    minHeight: 34,
    paddingHorizontal: space.md,
    borderRadius: round.pill,
    borderWidth: 1,
  },
  triggerIdle: {
    backgroundColor: night.surface,
    borderColor: night.line,
  },
  triggerActive: {
    backgroundColor: night.accent,
    borderColor: night.accent,
  },
  triggerPressed: {
    opacity: 0.7,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(14),
    color: night.textDim,
    includeFontPadding: false,
  },
  labelActive: {
    color: night.onAccent,
  },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: round.pill,
    backgroundColor: night.onAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(11),
    lineHeight: fontPercentage(14),
    color: night.accent,
    includeFontPadding: false,
  },
  reset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  resetLabel: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(13),
    color: night.textDim,
    includeFontPadding: false,
  },
});
