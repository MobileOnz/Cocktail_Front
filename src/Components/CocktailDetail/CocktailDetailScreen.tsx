// CocktailDetailScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Animated, Dimensions, Image, Text, View, StyleSheet, Pressable, TouchableOpacity, FlatList } from 'react-native';
import RNShare from 'react-native-share';
import { useToast } from '../ToastContext';
import ImageResizer from 'react-native-image-resizer';
import { ActivityIndicator } from 'react-native-paper';

import PillStyleStatus from '../PillStyleStatus';
import { RootStackParamList } from '../../Navigation/Navigation';
import { useNavigation } from '@react-navigation/native';
import { fontPercentage, heightPercentage, widthPercentage } from '../../assets/styles/FigmaScreen';
import useCocktailDetailViewModel from './CocktailDetailViewModel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CocktailCard from '../CocktailCard';
import Icon from 'react-native-vector-icons/Ionicons';
import instance from '../../tokenRequest/axios_interceptor';
import { unwrap } from '../../lib/api';
import type { CocktailStep as CocktailStepDto } from '../../types/api';
import { colors, fonts } from '../../lib/theme';
type Props = NativeStackScreenProps<RootStackParamList, 'CocktailDetailScreen'>;

/**
 * 항목 한 줄.
 *
 * 예전엔 좌측 라벨(60pt) + 우측 값이었는데, 여기에 값의 marginLeft 20pt 까지 더해져
 * 폭의 약 25%가 라벨 열로 나갔다. "여름"(2글자)과 200자 유래가 같은 좁은 칸을 쓰다 보니
 * 긴 글이 오른쪽으로 몰려 잘게 꺾였다.
 *
 * → 라벨을 위로 올리고 값은 전폭을 쓴다. 짧은 값도 같은 리듬을 따르므로 목록이 고르게 읽힌다.
 */
/**
 * 섹션 한 덩어리.
 *
 * 예전엔 12pt 짜리 회색 슬래브(#e8e8e8)가 유일한 구분자여서, 섹션 사이가
 * '경계'가 아니라 '앱이 끊긴 빈칸'처럼 읽혔다("벙 떠 있다"). 슬래브를 걷어내고
 * 눈금(eyebrow) + 제목 + 여백의 리듬으로 나눈다. 구분이 필요한 곳만 1px 실선.
 *
 * tone='card' 는 누를 수 있는 묶음(만드는 법·반응)에만 쓴다 —
 * 읽는 섹션은 흰 바탕에 그대로 두어 표면이 늘어나지 않게 한다.
 */
const Section = ({
  eyebrow,
  title,
  tone = 'plain',
  children,
}: {
  eyebrow?: string;
  title?: string;
  tone?: 'plain' | 'card';
  children: React.ReactNode;
}) => (
  <View style={[styles.section, tone === 'card' && styles.sectionCard]}>
    {!!eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
    {!!title && <Text style={styles.sectionTitle}>{title}</Text>}
    {children}
  </View>
);

const DetailRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
  align?: 'center' | 'flex-start';
}) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueWrapper}>
        {children}
      </View>
    </View>
  );
};

// 백엔드 enum 이 그대로 노출되던 것(WEAK 등)을 한글로.
// 서버가 실제로 보내는 값은 WEAK / NORMAL / STRONG 이다.
// MEDIUM 으로 적어 두어 105종 중 48종(46%)의 도수 자리에 영문 "NORMAL" 이 그대로 노출됐다.
// 두 표기를 모두 받아 두어 서버가 어느 쪽을 보내도 한글이 나오게 한다.
const ABV_LABEL: Record<string, string> = {
  WEAK: '약함',
  NORMAL: '보통',
  MEDIUM: '보통',
  STRONG: '강함',
};

/**
 * 상단 바 아이콘 하나. 흰색(사진 위) 버전과 짙은 색(본문 위) 버전을 겹쳐 두고
 * 스크롤 진행도에 따라 크로스페이드한다. 사진 위 버전은 반투명 원형 스크림을 깔아
 * 사진 색과 무관하게 대비를 확보한다.
 */
const BarIcon = ({
  name,
  size = 22,
  photoOpacity,
  solidOpacity,
}: {
  name: string;
  size?: number;
  photoOpacity: Animated.AnimatedInterpolation<number>;
  solidOpacity: Animated.AnimatedInterpolation<number>;
}) => (
  <View style={styles.barIcon}>
    <Animated.View pointerEvents="none" style={[styles.barIconScrim, { opacity: photoOpacity }]} />
    <Animated.View style={[styles.barIconLayer, { opacity: photoOpacity }]}>
      <Icon name={name} size={size} color="#FFFFFF" />
    </Animated.View>
    <Animated.View style={[styles.barIconLayer, { opacity: solidOpacity }]}>
      <Icon name={name} size={size} color={colors.text} />
    </Animated.View>
  </View>
);

export function CocktailDetailScreen({ route }: Props) {

  const insets = useSafeAreaInsets();
  // 상단 바(뒤로/북마크/공유)는 스크롤과 무관하게 항상 떠 있다 — ScrollView 밖에 둔다.
  // 히어로 위에서는 사진이 어떤 색이든 아이콘이 보이도록 아이콘마다 반투명 원형 스크림을
  // 깔고 흰색으로 그린다. 히어로를 지나 본문(흰 배경)에 닿으면 바 배경이 흰색으로 차오르고
  // 아이콘은 짙은 색으로, 가운데 제목이 함께 떠오른다.
  // 레퍼런스: Airbnb 숙소 상세 / App Store 앱 페이지 / Google Maps 장소 상세의 공통 패턴.
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroHeight = (Dimensions.get('window').width * 4) / 3;
  const BAR_H = insets.top + widthPercentage(48);
  const fadeStart = heroHeight - BAR_H - heightPercentage(56);
  const fadeEnd = heroHeight - BAR_H;
  // 흰 바 배경 + 짙은 아이콘 + 하단 헤어라인이 함께 나타난다.
  const solidOpacity = scrollY.interpolate({
    inputRange: [fadeStart, fadeEnd],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  // 사진 위 흰 아이콘 + 원형 스크림은 반대로 사라진다.
  const photoOpacity = scrollY.interpolate({
    inputRange: [fadeStart, fadeEnd],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  // 제목은 바가 거의 다 찼을 때 마지막에 떠오른다.
  const titleOpacity = scrollY.interpolate({
    inputRange: [fadeEnd - heightPercentage(24), fadeEnd],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const { cocktailId } = route.params;
  const navigation = useNavigation<any>();

  const vm = useCocktailDetailViewModel(cocktailId);
  const stay10sTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 딥링크(공유 링크·유니버설 링크)로 상세에 바로 들어오면 뒤로 갈 스택이 없다.
  // 그대로 goBack 하면 'GO_BACK was not handled' 로 아무 반응이 없다 — 홈으로 보낸다.
  const onBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'BottomTabNavigator' }] });
    }
  };

  // 히어로 변형 이미지가 404 나면 원본으로 되돌린다(변형 URL 이 아직 없는 환경 대비).
  // 잔 이미지는 제거했다 — 13장을 105종이 돌려 쓰고 있어 상세마다 같은 그림이 반복됐다.
  const [heroErrored, setHeroErrored] = useState(false);
  const { showToast } = useToast();

  const handleShare = async () => {
    if (!vm.detail) { return; }
    const url = `https://onz-cocktail.kr/cocktail/${vm.detail.id}`;
    const message = `${vm.detail.korName} 칵테일을 확인해보세요!\n\n${url}`;
    const imgUri = heroErrored
      ? vm.detail.imageUrl
      : (vm.detail.imageUrlDetail ?? vm.detail.imageUrl);

    // 칵테일 이미지를 로컬 파일로 받아 함께 공유한다.
    // (RN Android 는 원격 URL·base64 첨부가 불안정해 로컬 파일 경로로 넘긴다.)
    // 이미지 준비가 실패하면 링크만으로 폴백한다.
    // 공유 시트를 닫고 나면 아무 반응이 없어 "된 건가?" 싶다는 QA 가 있었다.
    // 결과를 받아 한 줄 알린다. 링크 복사를 고른 경우는 문구를 달리한다.
    const notify = (res: any) => {
      if (!res || res.success === false) { return; }
      const target = String(res.message ?? res.app ?? '');
      const copied = /copy|pasteboard|clipboard/i.test(target);
      showToast(copied ? '링크가 복사되었습니다.' : '공유했습니다.');
    };

    try {
      const local = await ImageResizer.createResizedImage(imgUri, 1200, 1600, 'JPEG', 90);
      notify(await RNShare.open({
        title: vm.detail.korName,
        message,
        url: local.uri,
        type: 'image/jpeg',
        failOnCancel: false,
      }));
    } catch (e) {
      try {
        notify(await RNShare.open({ title: vm.detail.korName, message, failOnCancel: false }));
      } catch {
        // 사용자가 공유 시트를 닫은 경우 등 — 무시.
      }
    }
  };

  useEffect(() => {
    if (!vm.detail) {return;}
    vm.trackViewDetail('cocktail_detail');
    stay10sTimerRef.current = setTimeout(() => {
      vm.trackStay10s('cocktail_detail');
    }, 10000);
    return () => {
      if (stay10sTimerRef.current) {clearTimeout(stay10sTimerRef.current);}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vm.detail]);

  // 제조 단계 — 예전엔 별도 화면으로만 갈 수 있었다. 순서를 상세에서 바로 보여준다.
  const [steps, setSteps] = useState<CocktailStepDto[]>([]);
  // 연결된 가이드. 예전엔 서버가 주지도 않는 detail.guidePart 를 보고 있어서
  // 항상 undefined → 가이드 '목록 최상단'으로 떨어졌다. 실제 API 로 바꾼다.
  const [guide, setGuide] = useState<{ part: number; title: string; imageUrl: string | null } | null>(null);
  useEffect(() => {
    const id = vm.detail?.id;
    if (!id) { return; }
    let alive = true;
    instance.get(`/api/v2/cocktails/${id}/steps`)
      .then(res => { if (alive) { setSteps(unwrap<CocktailStepDto[]>(res) ?? []); } })
      .catch(() => { if (alive) { setSteps([]); } });  // 단계는 부가정보다. 없으면 섹션만 빠진다.
    return () => { alive = false; };
  }, [vm.detail?.id]);

  useEffect(() => {
    const id = vm.detail?.id;
    if (!id) { return; }
    let alive = true;
    instance.get(`/api/v2/cocktails/${id}/guides`)
      .then(res => {
        if (!alive) { return; }
        const list = unwrap<{ part: number; title: string; imageUrl: string | null }[]>(res) ?? [];
        setGuide(list.find(g => g?.part != null) ?? null);
      })
      .catch(() => { if (alive) { setGuide(null); } });
    return () => { alive = false; };
  }, [vm.detail?.id]);

  //  로딩 상태
  if (vm.loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>불러오는 중...</Text>
      </View>
    );
  }

  //  에러 상태
  if (vm.error || !vm.detail) {
    return (
      <View style={styles.centerContainer}>
        <Text>{vm.error ?? '칵테일 정보를 찾을 수 없습니다.'}</Text>
      </View>
    );
  }

  // 도수는 밴드(약함/보통/강함)보다 실제 수치가 유용하다. 둘 다 있으면 수치를 쓴다.
  const abvBandLabel = ABV_LABEL[vm.detail.abvBand] ?? vm.detail.abvBand;
  const abvText =
    vm.detail.minAlcohol != null && vm.detail.maxAlcohol != null
      ? `${vm.detail.minAlcohol}–${vm.detail.maxAlcohol}%`
      : abvBandLabel;

  // 정상 렌더링
  return (
    <View style={styles.container}>
    <Animated.ScrollView
      style={styles.container}
      scrollEventThrottle={16}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: heroErrored
              ? vm.detail.imageUrl
              : (vm.detail.imageUrlDetail ?? vm.detail.imageUrl),
          }}
          style={styles.image}
          onError={() => setHeroErrored(true)}
        />

        {/* 07안 — 사진 크기를 유지한 채 하단 그라데이션 위에 이름과 핵심 스펙을 얹는다.
            스크롤하기 전에 "무엇을 마시는지 / 얼마나 센지 / 어떤 잔에 만드는지"가 다 보인다.

            잔은 '사진 속 잔'이 아니라 '이 칵테일에 쓰는 잔'이다. 사진은 연출 컷이라
            표기와 다른 잔으로 찍힌 경우가 있다(표본 3종 중 2종에서 확인). 그래서 라벨을
            '추천 잔'으로 두어 사진을 설명하는 말이 아님을 분명히 한다. */}
        <View style={styles.heroScrim} pointerEvents="none" />
        <View style={styles.heroOverlay} pointerEvents="box-none">
          <Text style={styles.korText} lineBreakStrategyIOS="hangul-word">{vm.detail.korName}</Text>
          <Text style={styles.engText}>{vm.detail.engName}</Text>
          <View style={styles.heroSpecs}>
            <View style={styles.heroSpec}>
              <Text style={styles.heroSpecKey}>도수</Text>
              <Text style={styles.heroSpecVal}>{abvText}</Text>
            </View>
            <View style={styles.heroSpec}>
              <Text style={styles.heroSpecKey}>베이스</Text>
              <Text style={styles.heroSpecVal} numberOfLines={1}>{vm.detail.base}</Text>
            </View>
            <View style={styles.heroSpec}>
              <Text style={styles.heroSpecKey}>추천 잔</Text>
              <Text style={styles.heroSpecVal} numberOfLines={1}>{vm.detail.glassType}</Text>
            </View>
          </View>
        </View>
      </View>


      {/* 스타일 */}
      <View style={styles.contentWrapper}>
        <DetailRow label="스타일" align="center">
          <PillStyleStatus tone={vm.detail.style} />
        </DetailRow>

        <DetailRow label="유래·역사">
          <Text style={[styles.valueText, { letterSpacing: 0.57 }]}>{vm.detail.originText}</Text>
        </DetailRow>

        <DetailRow label="맛">
          <Text style={styles.valueText}>
            {vm.detail.flavors.join(' • ')}
          </Text>
        </DetailRow>
        <DetailRow label="분위기">
          <Text style={styles.valueText}> {vm.detail.moods.join(' • ')}</Text>
        </DetailRow>
        <DetailRow label="계절">
          <Text style={styles.valueText}> {vm.detail.season}</Text>
        </DetailRow>
        <DetailRow label="재료">
          <View style={{ flexDirection: 'column', gap: 6 }}>
            {vm.detail.ingredients.map((item, index) => (
              <Text key={`ingredient-${index}`} style={styles.valueText}>
                {item}
              </Text>
            ))}
          </View>
        </DetailRow>

      </View>


      {steps.length > 0 && (
        <Section eyebrow="RECIPE" title="만드는 순서">
          {steps.map((st, i) => (
            <View key={`step-${st.stepOrder ?? i}`} style={styles.stepRow}>
              {/* 번호를 잇는 세로 레일 — 네 줄이 따로 노는 대신 하나의 흐름으로 읽힌다.
                  마지막 단계에는 레일을 그리지 않는다. */}
              <View style={styles.stepRail}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                {i < steps.length - 1 && <View style={styles.stepLine} />}
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepText} lineBreakStrategyIOS="hangul-word">
                  {st.instruction}
                </Text>
                {!!st.tip && <Text style={styles.stepTip}>{st.tip}</Text>}
                {!!st.durationSec && (
                  <Text style={styles.stepDuration}>{st.durationSec}초</Text>
                )}
              </View>
            </View>
          ))}

          {/* 단계별 화면(도구·타이머)으로 가는 입구.
              예전엔 섹션 바깥에 검은 카드로 혼자 놓여 앞뒤 어디에도 붙지 않아 보였고
              (QA: "그것만 너무 붕 떠 있다"), 단계가 하나도 없을 때조차 떠 있어
              눌러도 빈 화면으로 들어갔다. → 이 섹션의 마지막 줄로 붙이고,
              단계가 있을 때만 함께 나타난다. */}
          <TouchableOpacity
            style={styles.stepsCta}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${vm.detail.korName} 단계별로 따라 하기`}
            onPress={() =>
              navigation.navigate('CocktailStepsScreen', {
                cocktailId: vm.detail!.id,
                cocktailName: vm.detail!.korName,
              })
            }
          >
            <Text style={styles.stepsCtaTitle}>단계별로 따라 하기</Text>
            <Text style={styles.stepsCtaArrow}>›</Text>
          </TouchableOpacity>
        </Section>
      )}

      <Section tone="card" eyebrow="당신의 한 줄" title="이 칵테일, 입문자도 즐길 수 있을까요?">
        <View style={styles.buttonContainer}>
        <Pressable style={[styles.button,
        vm.myReaction === 'RECOMMEND' && { backgroundColor: '#333' }]}
          onPress={() => { vm.handleReaction('RECOMMEND'); }}>
          <Text style={[styles.text, vm.myReaction === 'RECOMMEND' && { color: '#FFFFFF' }]}>
            추천해요 🍸</Text>
        </Pressable>
        <Pressable style={[styles.button,
        vm.myReaction === 'HARD' && { backgroundColor: '#333' }]}
          onPress={() => { vm.handleReaction('HARD'); }}>
          <Text style={[styles.text, vm.myReaction === 'HARD' && { color: '#FFFFFF' }]}>
            조금 어려워요🤔</Text>
          </Pressable>
        </View>
      </Section>

      <Section eyebrow="비슷한 취향" title="이런 칵테일은 어떠세요?">
        <FlatList
        data={vm.recommendedCocktails}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `recommended-${item.id}`}
        // Section 이 이미 좌우 20 을 준다. 그 위에 또 20 을 얹으면 카드만 40 에서 시작해
        // 제목과 기준선이 어긋난다. 패딩을 상쇄해 20 에 맞추고, 대신 카드가 화면 끝까지 흐르게 둔다.
        style={{ marginTop: heightPercentage(16), marginHorizontal: -widthPercentage(20) }}
        contentContainerStyle={{
          paddingLeft: widthPercentage(20),
          paddingRight: widthPercentage(20),
        }}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
        renderItem={({ item }) => (
          <CocktailCard
            id={item.id}
            name={item.name}
            image={item.image}
            type={item.type}
            bookmarked={item.isBookmarked}
            onPress={() =>
              navigation.navigate('CocktailDetailScreen', {
                cocktailId: item.id,
              })
            }
            onToggleBookmark={() => {
              vm.bookmarked(item.id);
            }}
            />
          )}
        />
      </Section>

      {/* 연결된 가이드가 있을 때만 띄운다. 없는데 "더 읽기"를 보여주고 목록 맨 위로
          떨어뜨리면 눌러본 사람을 헛걸음시킨다. 실제로 105종 중 12종만 연결돼 있다. */}
      {guide && (
        <Section eyebrow="이어서 읽기" title="이 칵테일의 이야기">
          <TouchableOpacity
            style={styles.storyCard}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel={`가이드 '${guide.title}' 보러가기`}
            onPress={() => {
              navigation.navigate('GuideDetailScreen', {
                id: guide.part,
                src: guide.imageUrl ?? vm.detail?.imageUrl,
                title: guide.title,
              });
            }}
          >
            <Text style={styles.storyCardTitle}>{guide.title}</Text>
            <Text style={styles.storyCardBody} numberOfLines={2}>
              가이드에서 이어서 읽기
            </Text>
          </TouchableOpacity>
        </Section>
      )}

      <View style={{ height: heightPercentage(100) }} />
    </Animated.ScrollView>

    {/* 고정 상단 바 — ScrollView 밖. 히어로 위에선 투명, 본문에 닿으면 흰 배경이 차오른다. */}
    <View
      pointerEvents="box-none"
      style={[styles.topBar, { height: BAR_H, paddingTop: insets.top }]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.topBarBg, { opacity: solidOpacity }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.topBarHairline, { opacity: solidOpacity }]}
      />

      <TouchableOpacity
        onPress={onBack}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="뒤로가기"
      >
        <BarIcon name="chevron-back" size={24} photoOpacity={photoOpacity} solidOpacity={solidOpacity} />
      </TouchableOpacity>

      <Animated.Text
        numberOfLines={1}
        style={[styles.topBarTitle, { opacity: titleOpacity }]}
      >
        {vm.detail.korName}
      </Animated.Text>

      <View style={styles.topBarRight}>
        <TouchableOpacity
          onPress={() => {
            if (vm.detail?.id) { vm.bookmarked(Number(vm.detail.id)); }
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={vm.detail?.isBookmarked ? '북마크 해제' : '북마크'}
        >
          <BarIcon
            name={vm.detail?.isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={22}
            photoOpacity={photoOpacity}
            solidOpacity={solidOpacity}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="공유하기"
        >
          <BarIcon name="share-social-outline" size={22} photoOpacity={photoOpacity} solidOpacity={solidOpacity} />
        </TouchableOpacity>
      </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── 07안 히어로 오버레이 ──────────────────────────────────────────────
  heroScrim: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: heightPercentage(150),
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  heroOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: widthPercentage(20) },
  heroSpecs: { flexDirection: 'row', marginTop: heightPercentage(12), columnGap: widthPercentage(22) },
  heroSpec: { flexShrink: 1 },
  heroSpecKey: {
    fontFamily: fonts.medium, fontSize: fontPercentage(10),
    color: 'rgba(255,255,255,0.65)', letterSpacing: 0.4, marginBottom: 2,
  },
  heroSpecVal: { fontFamily: fonts.semibold, fontSize: fontPercentage(14), color: '#FFFFFF' },

  // ── 제조 순서 ────────────────────────────────────────────────────────
  stepsBlock: { paddingHorizontal: widthPercentage(20), paddingTop: heightPercentage(8) },
  sectionHeading: {
    fontFamily: fonts.semibold, fontSize: fontPercentage(16),
    color: colors.text, marginBottom: heightPercentage(14),
  },
  /**
   * 화면 전체의 좌우 기준선.
   * 예전엔 항목행 16 / 값 +20 / 리액션 10 / 가로리스트 16 이 뒤섞여
   * 문구마다 다른 위치에서 시작해 "왼쪽으로 치우쳤다"는 인상을 줬다.
   */
  sectionPad: { paddingHorizontal: widthPercentage(20) },

  // ── 섹션 체계 ────────────────────────────────────────────────────────
  // 회색 슬래브 대신 여백과 눈금으로 나눈다. 좌우 기준선은 전부 20 하나.
  section: {
    paddingHorizontal: widthPercentage(20),
    paddingTop: heightPercentage(28),
    paddingBottom: heightPercentage(4),
  },
  // 누를 수 있는 묶음만 표면을 준다. 읽는 섹션은 흰 바탕 그대로.
  sectionCard: {
    backgroundColor: colors.bgSubtle,
    marginTop: heightPercentage(28),
    paddingTop: heightPercentage(22),
    paddingBottom: heightPercentage(22),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  eyebrow: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(11),
    letterSpacing: 1,
    color: colors.textTertiary,
    marginBottom: heightPercentage(5),
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(18),
    letterSpacing: -0.3,
    color: colors.text,
    marginBottom: heightPercentage(16),
  },

  // 번호를 잇는 세로 레일 — 순서가 하나의 흐름으로 읽히게 한다.
  stepRail: { alignItems: 'center', marginRight: widthPercentage(12) },
  stepLine: {
    flex: 1,
    width: 1,
    backgroundColor: colors.borderStrong,
    marginTop: heightPercentage(4),
    marginBottom: heightPercentage(-4),
  },
  stepRow: { flexDirection: 'row', paddingBottom: heightPercentage(18) },
  stepNum: {
    width: widthPercentage(22), height: widthPercentage(22), borderRadius: widthPercentage(11),
    backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  stepNumText: { fontFamily: fonts.semibold, fontSize: fontPercentage(11), color: colors.textInverse },
  stepBody: { flex: 1 },
  stepText: {
    fontFamily: fonts.regular, fontSize: fontPercentage(15),
    lineHeight: fontPercentage(24), color: colors.text,
  },
  stepTip: {
    fontFamily: fonts.regular, fontSize: fontPercentage(13),
    lineHeight: fontPercentage(20), color: colors.textTertiary, marginTop: heightPercentage(4),
  },
  stepDuration: {
    fontFamily: fonts.medium, fontSize: fontPercentage(12),
    color: colors.accentText, marginTop: heightPercentage(4),
  },
  container: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    columnGap: widthPercentage(10),
    marginTop: heightPercentage(4),
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    // 고정폭이면 섹션 좌우 기준선(20)을 넘어 오른쪽만 잘린다. 폭에 맞춰 균등 분할한다.
    flex: 1,
    height: heightPercentage(55),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Pretendard-Regular',
    fontSize: fontPercentage(16),
    color: '#1B1B1B',
  },
  row: {
    paddingVertical: heightPercentage(10),
    paddingHorizontal: widthPercentage(20),
  },
  valueWrapper: {
    width: '100%',
  },
  valueText: {
    fontFamily: fonts.regular,
    color: colors.text,
    fontSize: fontPercentage(15),
    lineHeight: fontPercentage(24),
  },
  // 마지막 단계 밑에 바로 붙는 줄. 앞의 단계 목록과 같은 기준선을 쓰고
  // 윗 실선으로만 구분한다 — 별도의 표면(검은 카드)을 만들지 않는다.
  stepsCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: heightPercentage(4),
    paddingVertical: heightPercentage(14),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stepsCtaTitle: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(15),
    color: colors.text,
  },
  stepsCtaArrow: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(20),
    color: colors.textTertiary,
  },
  storyCard: {
    marginTop: heightPercentage(12),
    // Section 이 좌우 20 을 이미 준다. 여기서 또 주면 이 카드만 안쪽으로 밀린다.
    padding: widthPercentage(16),
    borderRadius: widthPercentage(12),
    backgroundColor: '#F5F5F5',
  },
  storyCardTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: fontPercentage(14),
    color: '#1B1B1B',
    marginBottom: heightPercentage(6),
  },
  storyCardBody: {
    fontFamily: 'Pretendard-Regular',
    fontSize: fontPercentage(13),
    color: '#616161',
    lineHeight: fontPercentage(20),
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontPercentage(12),
    color: colors.textTertiary,
    marginBottom: heightPercentage(6),
  },
  contentWrapper: {

    marginVertical: heightPercentage(15),
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 로딩 텍스트
  loadingText: {
    fontFamily: 'Pretendard-Medium',
    marginTop: 8,
  },
  imageContainer: {
    position: 'relative',
  },

  // 이미지
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
    resizeMode: 'cover',
  },
  // 예전엔 둘 다 position:'absolute' + bottom(한글 40 / 영문 75)이라
  // 영문이 한글 '위'에 떴고, 크기도 20 으로 같았다. 오버레이 안에서는 흐름대로 쌓아
  // 한글을 크게 먼저, 영문을 작게 뒤에 둔다.
  korText: {
    fontFamily: fonts.bold,
    fontSize: fontPercentage(24),
    lineHeight: fontPercentage(30),
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  engText: {
    fontFamily: fonts.regular,
    fontSize: fontPercentage(13),
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  // ── 고정 상단 바 ─────────────────────────────────────────────────────
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: widthPercentage(12),
  },
  topBarBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
  },
  topBarHairline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: widthPercentage(8),
    fontFamily: fonts.semibold,
    fontSize: fontPercentage(16),
    color: colors.text,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barIcon: {
    width: widthPercentage(40),
    height: widthPercentage(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  barIconScrim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: widthPercentage(20),
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  barIconLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusWrapper: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  // 타이틀 & 요약
  fontStyle: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    color: '#616161',
    marginRight: widthPercentage(10),
  },
  summary: {
    fontFamily: 'Pretendard-Medium',
    marginTop: 8,
  },


  // 스토리 본문
  story: {
    fontFamily: 'Pretendard-Medium',
    marginTop: 4,
  },

  infoBox: {
    marginTop: 16,
  },

  footerBox: {
    marginTop: 16,
    marginBottom: 24,
  },
});
export default CocktailDetailScreen;
