import React, { forwardRef, useImperativeHandle } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { FilterState, useFilterBottomSheetViewModel } from './FilterBottomSheetViewModel';
import theme from '../../../assets/styles/theme';
import { heightPercentage } from '../../../assets/styles/FigmaScreen';


const sortOptions = ['최신순', '인기순'] as const;

const degreeOptions = ['약함', '보통', '강함'];

const styleOptions = ['라이트', '스탠다드', '스페셜', '스트롱', '클래식'];

const tasteOptions = [
  '과일(Fruity)',
  '쌉쌀함(Bitter)',
  '달콤함(Sweet)',
  '부드러움(Creamy/Soft)',
  '복합적인 맛(Complex)',
  '허브 & 스파이스(Herb & Spice)',
  '라이트 & 청량함(Light & Refreshing)',
  '개성 강한 맛(Unique & Strong)',
  '기타 & 특별한 맛(Etc. & Unique Flavors)',
];

const baseOptions = [
  '진',
  '위스키',
  '럼',
  '보드카',
  '데킬라',
  '브랜디',
  '리큐르',
  '와인',
  '기타',
];
export type FilterBottomSheetRef = {
  reset: () => void;
  apply: () => void;
  getValue: () => FilterState;
};

type Props = {
  initialValue?: FilterState;
  onApply?: (value: FilterState) => void;
  onClose?: () => void;
};


export const FilterBottomSheet = forwardRef<FilterBottomSheetRef, Props>(
  ({ initialValue, onApply }, ref) => {
    const vm = useFilterBottomSheetViewModel({ initialValue, onApply });

    useImperativeHandle(ref, () => ({
      reset: vm.reset,
      apply: vm.apply,
      getValue: () => vm.value,
    }));

    const insets = useSafeAreaInsets();
    const FOOTER_HEIGHT = heightPercentage(50) + 12 + 12; // 버튼높이+위아래패딩(대충)

    const toggleValue = (list: string[], value: string, setter: (v: string[]) => void) => {
      if (list.includes(value)) {
        setter(list.filter(item => item !== value));
      } else {
        setter([...list, value]);
      }
    };

    const Tag = ({
      label,
      selected,
      onPress,
    }: {
      label: string;
      selected: boolean;
      onPress: () => void;
    }) => (
      <TouchableOpacity
        style={[styles.tag, selected && styles.tagSelected]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={[styles.tagText, selected && styles.tagTextSelected]}>{label}</Text>
      </TouchableOpacity>
    );


    const Radio = ({
      label,
      selected,
      onPress,
    }: {
      label: string;
      selected: boolean;
      onPress: () => void;
    }) => (
      <Pressable style={styles.radioRow} onPress={onPress}>
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.radioLabel}>{label}</Text>
      </Pressable>
    );

    return (
      <SafeAreaView style={styles.container}>

        <BottomSheetScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: FOOTER_HEIGHT + insets.bottom + 16 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* 정렬 */}
          <View style={styles.section}>
            <Pressable onPress={() => { }}>
              <MaterialIcons name="close" size={24} style={{ alignSelf: 'flex-end', padding: 10 }} />
            </Pressable>
            <Text style={styles.sectionTitle}>정렬</Text>
            <View style={styles.radioGroup}>
              {sortOptions.map(option => (
                <Radio
                  key={option}
                  label={option}
                  selected={vm.selectedSort === option}
                  onPress={() => vm.setSelectedSort(option)}
                />
              ))}
            </View>
          </View>

          {/* 도수 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>도수</Text>
            <View style={styles.tagGroup}>
              {degreeOptions.map(option => (
                <Tag
                  key={option}
                  label={option}
                  selected={vm.selectedDegree === option}
                  onPress={() => vm.setSelectedDegree(option)}
                />
              ))}
            </View>
          </View>

          {/* 스타일 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>스타일</Text>
            <View style={styles.tagGroup}>
              {styleOptions.map(option => (
                <Tag
                  key={option}
                  label={option}
                  selected={vm.selectedStyle === option}
                  onPress={() => vm.setSelectedStyle(option)}
                />
              ))}
            </View>
          </View>

          {/* 맛 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>맛</Text>
            <View style={styles.tagGroup}>
              {tasteOptions.map(option => (
                <Tag
                  key={option}
                  label={option}
                  selected={vm.selectedTaste.includes(option)}
                  onPress={() => toggleValue(vm.selectedTaste, option, vm.setSelectedTaste)}
                />
              ))}
            </View>
          </View>

          {/* 베이스 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>베이스</Text>
            <View style={styles.tagGroup}>
              {baseOptions.map(option => (
                <Tag
                  key={option}
                  label={option}
                  selected={vm.selectedBase.includes(option)}
                  onPress={() => toggleValue(vm.selectedBase, option, vm.setSelectedBase)}
                />
              ))}
            </View>
          </View>

        </BottomSheetScrollView>


      </SafeAreaView>
    );
  }
);

export default FilterBottomSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1B1B1B',
    marginBottom: 10,
  },
  radioGroup: {
    gap: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#C8C8C8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: '#111111',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111111',
  },
  radioLabel: {
    fontSize: 14,
    color: '#1B1B1B',
  },
  tagGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: theme.background,
  },
  tagSelected: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  tagText: {
    fontSize: 13,
    color: '#333333',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
  footer: {
    paddingTop: 12,
    backgroundColor: theme.background,
    flexDirection: 'row',
    columnGap: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
    zIndex: 10,
    elevation: 10,
  },
  resetButton: {
    flex: 1,
    height: heightPercentage(50),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background,
  },
  applyButton: {
    flex: 1,
    height: heightPercentage(50),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
  },
  resetText: {
    fontSize: 14,
    color: '#444444',
    fontWeight: '500',
  },
  applyText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
