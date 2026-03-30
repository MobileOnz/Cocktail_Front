import React, { useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button, RadioButton } from 'react-native-paper';
import theme from '../../assets/styles/theme';
import UseOnboarindViewModel from './OnboarindViewModel';

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
    container: { flex: 1, backgroundColor: theme.background },
    content: { paddingHorizontal: 24, paddingTop: 40 },
    header: { marginBottom: 40 },
    titleText: {
        fontFamily: 'Pretendard-Medium',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 12,
        color: '#000',
    },
    subText: {
        fontFamily: 'Pretendard-Medium',
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    section: { marginBottom: 32 },
    sectionTitle: {
        fontFamily: 'Pretendard-Medium',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
        color: '#000',
    },

    // 라디오 버튼 스타일
    radioGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    radioItem: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
    radioLabel: {
        fontFamily: 'Pretendard-Medium',
        fontSize: 15,
        color: '#333',
    },

    // 연령대 칩 스타일
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    chip: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#fff',
        minWidth: '30%',
        alignItems: 'center',
    },
    selectedChip: { backgroundColor: '#333', borderColor: '#333' },
    chipText: {
        fontFamily: 'Pretendard-Medium',
        fontSize: 14,
        color: '#333',
    },
    selectedChipText: {
        fontFamily: 'Pretendard-Medium',
        color: '#fff',
        fontWeight: '600',
    },

    // 하단 버튼 스타일
    footer: { padding: 20, backgroundColor: '#fff' },
    startButton: { borderRadius: 12, height: 56, justifyContent: 'center' },
    buttonActive: { backgroundColor: '#333' },
    buttonDisabled: { backgroundColor: '#E0E0E0' },
    buttonLabel: {
        fontFamily: 'Pretendard-Medium',
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});

export default OnboardingScreen;
