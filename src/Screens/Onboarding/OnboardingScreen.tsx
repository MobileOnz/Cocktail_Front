import React, { useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Text, Button, RadioButton } from 'react-native-paper';
import { colors } from '../../lib/theme';
import UseOnboarindViewModel from './OnboarindViewModel';

// 연령대 칩을 3열 격자로 정확히 맞춘다.
// minWidth:'30%' 로 두면 폭이 글자 길이를 따라가 '19세 이하'만 넓어지고 열이 어긋난다.
const H_PADDING = 24;
const CHIP_GAP = 12;
const CHIP_COLUMNS = 3;
const CHIP_WIDTH =
    (Dimensions.get('window').width - H_PADDING * 2 - CHIP_GAP * (CHIP_COLUMNS - 1)) / CHIP_COLUMNS;

const OnboardingScreen = ({ setIsOnboarded }: any) => {
    const vm = UseOnboarindViewModel({ onComplete: () => setIsOnboarded(true) });

    // 모든 정보가 입력되었는지 확인 (버튼 활성화 조건)
    const isFormValid = useMemo(() => {
        return vm.gender !== '' && vm.ageRange !== '';
    }, [vm.gender, vm.ageRange]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* 헤더 섹션 */}
                <View style={styles.header}>
                    <Text style={styles.titleText}>몇 가지만 알려주세요 😊</Text>
                    <Text style={styles.subText}>
                        더 나은 서비스 경험을 제공하는 데 필요한 정보예요.{'\n'}
                        누구인지 알 수 있는 정보는 수집하지 않아요.
                    </Text>
                </View>

                {/* 성별 선택 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>성별</Text>
                    <View style={styles.radioGroup}>
                        <TouchableOpacity style={styles.radioItem} onPress={() => vm.setGender('female')}>
                            <RadioButton.Android
                                value="female"
                                status={vm.gender === 'female' ? 'checked' : 'unchecked'}
                                onPress={() => vm.setGender('female')}
                                color="#333"
                            />
                            <Text style={styles.radioLabel}>여성</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.radioItem} onPress={() => vm.setGender('male')}>
                            <RadioButton.Android
                                value="male"
                                status={vm.gender === 'male' ? 'checked' : 'unchecked'}
                                onPress={() => vm.setGender('male')}
                                color="#333"
                            />
                            <Text style={styles.radioLabel}>남성</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.radioItem} onPress={() => vm.setGender('none')}>
                            <RadioButton.Android
                                value="none"
                                status={vm.gender === 'none' ? 'checked' : 'unchecked'}
                                onPress={() => vm.setGender('none')}
                                color="#333"
                            />
                            <Text style={styles.radioLabel}>선택안함</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 연령대 선택 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>연령대</Text>
                    <View style={styles.chipContainer}>
                        {vm.ageOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.chip,
                                    vm.ageRange === option.value && styles.selectedChip,
                                ]}
                                onPress={() => vm.setAgeRange(option.value)}
                            >
                                <Text style={[
                                    styles.chipText,
                                    vm.ageRange === option.value && styles.selectedChipText,
                                ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* 하단 시작하기 버튼 */}
            <View style={styles.footer}>
                <Button
                    loading={vm.isLoading}
                    mode="contained"
                    disabled={!isFormValid || vm.isLoading}
                    style={[
                        styles.startButton,
                        isFormValid ? styles.buttonActive : styles.buttonDisabled,
                    ]}
                    labelStyle={styles.buttonLabel}
                    onPress={vm.postUserInfo}
                >
                    온즈 시작하기
                </Button>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    // 질문이 둘뿐이라 위로 붙이면 화면 아래 절반이 통째로 비어 보였다.
    // 남는 공간을 위아래로 나눠 콘텐츠를 광학 중앙에 둔다(작은 화면에서는 그대로 스크롤된다).
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: H_PADDING,
        paddingVertical: 32,
    },
    header: { marginBottom: 40 },
    // 제목이 Regular, 부제가 Medium 이라 부제가 더 굵어 위계가 뒤집혀 있었다.
    titleText: {
        fontFamily: 'Pretendard-Bold',
        fontSize: 24,
        lineHeight: 34,
        marginBottom: 12,
        color: '#000',
    },
    subText: {
        fontFamily: 'Pretendard-Regular',
        fontSize: 14,
        color: '#666',
        lineHeight: 21,
    },
    section: { marginBottom: 32 },
    sectionTitle: {
        fontFamily: 'Pretendard-SemiBold',
        fontSize: 16,
        marginBottom: 16,
        color: '#000',
    },

    // 라디오 버튼 스타일
    // gap 과 marginRight 를 같이 주면 간격이 이중으로 들어간다. gap 하나로 통일.
    radioGroup: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    radioItem: { flexDirection: 'row', alignItems: 'center' },
    radioLabel: {
        fontFamily: 'Pretendard-Regular',
        fontSize: 15,
        color: '#333',
    },

    // 연령대 칩 스타일 — 폭을 고정해 3열 격자를 맞춘다.
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: CHIP_GAP },
    chip: {
        width: CHIP_WIDTH,
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedChip: { backgroundColor: '#333', borderColor: '#333' },
    chipText: {
        fontFamily: 'Pretendard-Medium',
        fontSize: 14,
        color: '#333',
    },
    selectedChipText: {
        fontFamily: 'Pretendard-SemiBold',
        color: '#FFFFFF',
    },

    // 하단 버튼 스타일
    // 콘텐츠와 멀리 떨어져 홀로 떠 보였다 → 윗 실선으로 '하단 영역'임을 드러낸다.
    footer: {
        paddingHorizontal: H_PADDING,
        paddingTop: 16,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F3F5',
    },
    startButton: { borderRadius: 12, height: 56, justifyContent: 'center' },
    buttonActive: { backgroundColor: '#333' },
    buttonDisabled: { backgroundColor: '#E0E0E0' },
    buttonLabel: {
        fontFamily: 'Pretendard-SemiBold',
        fontSize: 16,
        color: '#FFFFFF',
    },
});

export default OnboardingScreen;
