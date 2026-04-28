import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DeviceInfo from 'react-native-device-info';
import {
  heightPercentage,
  widthPercentage,
  fontPercentage,
} from '../../../assets/styles/FigmaScreen';
import { RootStackParamList } from '../../../Navigation/Navigation';
import instance from '../../../tokenRequest/axios_interceptor';
import { getToken } from '../../../tokenRequest/Token';
import { useToast } from '../../../Components/ToastContext';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const TITLE_MAX_LENGTH = 200;
const CONTENT_MIN_LENGTH = 5;

const InquiryFormScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);

  const validate = (): boolean => {
    let ok = true;
    if (!title.trim()) {
      setTitleError('제목을 입력해 주세요.');
      ok = false;
    } else {
      setTitleError(null);
    }
    if (!content.trim()) {
      setContentError('내용을 입력해 주세요.');
      ok = false;
    } else if (content.trim().length < CONTENT_MIN_LENGTH) {
      setContentError(`내용은 최소 ${CONTENT_MIN_LENGTH}자 이상 입력해 주세요.`);
      ok = false;
    } else {
      setContentError(null);
    }
    return ok;
  };

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      const body: {
        title: string;
        content: string;
        contact?: string;
        device_number?: string;
      } = {
        title: title.trim(),
        content: content.trim(),
      };
      if (contact.trim()) {
        body.contact = contact.trim();
      }
      if (!token) {
        const deviceId = await DeviceInfo.getUniqueId();
        body.device_number = deviceId;
      }

      const res = await instance.post('/api/v2/inquiry', body);
      if (res.data?.code === 1) {
        showToast('문의가 접수되었습니다. 답변 드리겠습니다.');
        navigation.goBack();
      } else {
        showToast(`전송 실패: ${res.data?.msg ?? '알 수 없는 오류'}`);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.msg ||
        err?.message ||
        '알 수 없는 오류가 발생했습니다.';
      showToast(`전송 실패: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitDisabled =
    submitting || !title.trim() || content.trim().length < CONTENT_MIN_LENGTH;

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../../assets/drawable/left-chevron.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>1:1 문의하기</Text>
        <View style={styles.backIcon} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 제목 */}
          <Text style={styles.label}>
            제목 <Text style={styles.requiredMark}>*</Text>
          </Text>
          <View
            style={[
              styles.inputContainer,
              titleError ? styles.inputContainerError : null,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="제목을 입력해 주세요"
              placeholderTextColor="#BDBDBD"
              value={title}
              onChangeText={(v) => {
                setTitle(v);
                if (titleError) {
                  setTitleError(null);
                }
              }}
              maxLength={TITLE_MAX_LENGTH}
            />
          </View>
          <View style={styles.helperRow}>
            {titleError ? (
              <Text style={styles.errorText}>{titleError}</Text>
            ) : (
              <View />
            )}
            <Text style={styles.counterText}>
              {title.length}/{TITLE_MAX_LENGTH}
            </Text>
          </View>

          {/* 내용 */}
          <Text style={[styles.label, styles.labelGap]}>
            내용 <Text style={styles.requiredMark}>*</Text>
          </Text>
          <View
            style={[
              styles.textAreaContainer,
              contentError ? styles.inputContainerError : null,
            ]}
          >
            <TextInput
              style={styles.textArea}
              placeholder="문의하실 내용을 자세히 적어주세요."
              placeholderTextColor="#BDBDBD"
              value={content}
              onChangeText={(v) => {
                setContent(v);
                if (contentError) {
                  setContentError(null);
                }
              }}
              multiline
              textAlignVertical="top"
            />
          </View>
          {contentError ? (
            <Text style={styles.errorText}>{contentError}</Text>
          ) : null}

          {/* 연락처 */}
          <Text style={[styles.label, styles.labelGap]}>연락처</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="이메일 또는 전화번호"
              placeholderTextColor="#BDBDBD"
              value={contact}
              onChangeText={setContact}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <Text style={styles.helperText}>
            답변받으실 이메일/전화번호 (선택)
          </Text>
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitDisabled && styles.submitButtonDisabled,
          ]}
          disabled={isSubmitDisabled}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="#FAFAFA" />
          ) : (
            <Text style={styles.submitButtonText}>문의 보내기</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default InquiryFormScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: heightPercentage(52),
    paddingHorizontal: widthPercentage(16),
    paddingTop: heightPercentage(14),
    paddingBottom: heightPercentage(10),
  },
  headerTitle: {
    fontSize: fontPercentage(20),
    fontWeight: '600',
    color: '#1B1B1B',
  },
  backIcon: {
    width: widthPercentage(28),
    height: widthPercentage(28),
    resizeMode: 'contain',
  },
  scrollContent: {
    paddingHorizontal: widthPercentage(20),
    paddingTop: heightPercentage(8),
    paddingBottom: heightPercentage(120),
  },
  label: {
    fontSize: fontPercentage(14),
    fontWeight: '600',
    color: '#1B1B1B',
    marginBottom: heightPercentage(8),
  },
  labelGap: {
    marginTop: heightPercentage(20),
  },
  requiredMark: {
    color: '#E53935',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: heightPercentage(52),
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: widthPercentage(12),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputContainerError: {
    borderColor: '#E53935',
  },
  input: {
    flex: 1,
    fontSize: fontPercentage(15),
    fontWeight: '500',
    color: '#2D2D2D',
    padding: 0,
  },
  textAreaContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: widthPercentage(12),
    paddingVertical: heightPercentage(10),
    minHeight: heightPercentage(150),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    flex: 1,
    fontSize: fontPercentage(15),
    fontWeight: '500',
    color: '#2D2D2D',
    minHeight: heightPercentage(130),
    padding: 0,
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: heightPercentage(6),
  },
  helperText: {
    fontSize: fontPercentage(12),
    color: '#9E9E9E',
    marginTop: heightPercentage(6),
  },
  counterText: {
    fontSize: fontPercentage(12),
    color: '#9E9E9E',
  },
  errorText: {
    fontSize: fontPercentage(12),
    color: '#E53935',
    marginTop: heightPercentage(6),
  },
  submitButton: {
    position: 'absolute',
    bottom: heightPercentage(24),
    left: widthPercentage(16),
    right: widthPercentage(16),
    backgroundColor: '#313131',
    borderRadius: 8,
    height: heightPercentage(52),
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  submitButtonText: {
    fontSize: fontPercentage(16),
    color: '#FAFAFA',
    fontWeight: '600',
  },
});
