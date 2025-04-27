import React, { useState } from 'react';
import { View, Text, ScrollView, Button, StyleSheet, Alert } from 'react-native';

const TermsAndConditionsScreen = () => {
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>이용 약관</Text>

      <Text style={styles.sectionTitle}>제1조 (목적)</Text>
      <Text style={styles.sectionContent}>
        이 약관은 "Onz" 애플리케이션(이하 "앱")을 이용하는 이용자와 서비스 제공자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
      </Text>

      <Text style={styles.sectionTitle}>제2조 (용어의 정의)</Text>
      <Text style={styles.sectionContent}>
        1. "앱"이란 사용자가 현재 위치를 기준으로 칵테일 바를 검색하거나 추천받을 수 있도록 제공하는 모바일 서비스를 의미합니다.
      </Text>
      <Text style={styles.sectionContent}>
        2. "이용자"란 본 약관에 따라 앱에 접속하여 서비스를 이용하는 회원을 말합니다.
      </Text>
      <Text style={styles.sectionContent}>
        3. "회원"이란 SNS 계정을 통해 앱에 가입한 자를 의미합니다.
      </Text>

      <Text style={styles.sectionTitle}>제3조 (약관의 게시 및 개정)</Text>
      <Text style={styles.sectionContent}>
        1. 본 약관은 앱 초기 화면 및 설정 메뉴 등을 통해 이용자가 확인할 수 있도록 게시합니다.
      </Text>
      <Text style={styles.sectionContent}>
        2. 서비스 제공자는 관련 법령을 위반하지 않는 범위에서 본 약관을 개정할 수 있으며, 개정 시 앱 내 공지사항을 통해 고지합니다.
      </Text>

      <Text style={styles.sectionTitle}>제4조 (서비스의 제공 및 변경)</Text>
      <Text style={styles.sectionContent}>
        1. 서비스는 사용자의 현재 위치를 기반으로 칵테일 바 정보 제공, 검색 기능, 칵테일 추천 기능을 포함합니다.
      </Text>
      <Text style={styles.sectionContent}>
        2. 서비스 제공자는 운영상·기술상의 필요에 따라 서비스의 내용을 변경할 수 있으며, 이 경우 사전에 공지합니다.
      </Text>

      <Text style={styles.sectionTitle}>제5조 (회원가입 및 이용자격)</Text>
      <Text style={styles.sectionContent}>
        1. 회원가입은 SNS 인증 방식을 통해 이루어집니다.
      </Text>
      <Text style={styles.sectionContent}>
        2. 본 앱은 법적 음주 허용 연령(만 19세 이상)인 성인만 이용할 수 있습니다. 미성년자는 이용할 수 없습니다.
      </Text>

      <Text style={styles.sectionTitle}>제6조 (회원의 의무)</Text>
      <Text style={styles.sectionContent}>
        1. 이용자는 관계법령, 본 약관의 규정, 이용안내 및 주의사항 등을 준수해야 합니다.
      </Text>
      <Text style={styles.sectionContent}>
        2. 이용자는 서비스 이용 시 다음 행위를 해서는 안 됩니다.
      </Text>
      <Text style={styles.sectionContent}>
        - 타인의 개인정보 도용
        {'\n'}- 허위 정보 입력
        {'\n'}- 앱의 정상적인 운영을 방해하는 행위
      </Text>

      <Text style={styles.sectionTitle}>제7조 (서비스의 중단)</Text>
      <Text style={styles.sectionContent}>
        서비스 제공자는 천재지변, 시스템 점검 등 불가항력적 사유가 발생한 경우 서비스 제공을 일시적으로 중단할 수 있습니다.
      </Text>

      <Text style={styles.sectionTitle}>제8조 (면책조항)</Text>
      <Text style={styles.sectionContent}>
        1. 서비스 제공자는 이용자가 제공하는 정보의 정확성에 대해 보증하지 않습니다.
      </Text>
      <Text style={styles.sectionContent}>
        2. 이용자가 서비스를 이용하여 기대하는 수익이나 만족을 얻지 못한 것에 대해 책임을 지지 않습니다.
      </Text>

      <Text style={styles.sectionTitle}>제9조 (준거법 및 재판관할)</Text>
      <Text style={[styles.sectionContent, { marginBottom: 20 }]}>
        본 약관은 대한민국 법령에 따라 해석되며, 서비스 이용과 관련하여 분쟁이 발생할 경우 서울중앙지방법원을 1심 전속관할 법원으로 합니다.
      </Text>

      
     
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  sectionContent: {
    fontSize: 16,
    marginBottom: 10,
  },
  agreementContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
});

export default TermsAndConditionsScreen;
