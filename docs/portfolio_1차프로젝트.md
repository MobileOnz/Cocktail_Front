# 칵테일 바 탐색 앱 — 1차 프로젝트 포트폴리오

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | Cocktail_Front (1차) |
| **유형** | 모바일 앱 (React Native) |
| **플랫폼** | iOS / Android |
| **개발 기간** | 2025.02 ~ 2025.09 |
| **배포** | 앱스토어 v1.0.1 출시 |
| **팀 구성** | 프론트엔드 다수, 백엔드 협업 |

서울 내 칵테일 바를 지도 기반으로 탐색하고, 마음에 드는 바를 나만의 리스트에 저장할 수 있는 앱.
메인 화면이 지도(Google Maps)로 구성되어, 현재 위치 기반 주변 바 탐색 및 지역/키워드 필터링을 지원한다.

---

## 기술 스택

| 분야 | 기술 |
|------|------|
| 프레임워크 | React Native 0.73 |
| 지도 | react-native-maps (Google Maps Provider) |
| 장소 검색 | react-native-google-places-autocomplete |
| 바텀시트 | @gorhom/bottom-sheet |
| 애니메이션 | react-native-reanimated |
| GPS | react-native-geolocation-service, react-native-permissions |
| 내비게이션 | @react-navigation/native-stack, bottom-tabs |
| HTTP | axios |
| 상태관리 | React useState / useRef |

---

## 담당 역할 및 구현 내용

### 1. 지도 메인 화면 (`src/BottomTab/Maps.tsx`)

앱의 핵심 화면. Google Maps 위에 커스텀 마커와 바텀시트를 통합하여 탐색 UX를 구현.

**구현 내용**
- `react-native-maps` + `PROVIDER_GOOGLE` 기반 지도 렌더링
- 커스텀 마커: 아이콘 7종 + 바 이름 말풍선 표시, 선택 시 색상 반전(어두운 배경 → 밝은 배경)
- 바텀시트 6개 탭을 단일 `selectedTab` 상태로 전환 관리

```
selectedTab 값       표시 컴포넌트
─────────────────────────────────────────────
"search"           → 주변 바 목록 (SectionList)
"detail"           → 바 상세 뷰
"bookmark"         → 리스트 선택 시트
"region"           → 지역 필터 결과
"mylist"           → 나의 리스트
"myBardetailList"  → 리스트 내 바 목록
```

- 바텀시트 위치(애니메이션 값)를 `useSharedValue`로 추적 → 플로팅 버튼이 시트에 맞춰 슬라이드
- 현재 위치 버튼 / "이 지역 다시 검색" 버튼 구현 (지도 이동 후 재탐색)
- API: `GET /api/location/nearby?x=&y=` (초기 로드 + 재탐색)

**핵심 기술 포인트**
- `react-native-reanimated`의 `interpolate`로 바텀시트 위치 ↔ 버튼 translateY 연동
- `tracksViewChanges: false` 최적화로 마커 깜빡임 방지
- 커스텀 맵 스타일(JSON)로 POI, 대중교통 레이어 숨김 처리

---

### 2. 지역 검색 / 필터 (`src/Screens/RegionSelectScreen.tsx`, `src/BottomSheet/SelectedRegions.tsx`)

서울 23개 구를 선택하면 해당 지역의 바만 지도 및 목록에 표시.

**구현 내용 — RegionSelectScreen**
- FlatList로 서울 23개 구 렌더링, "서울 전체" 선택 시 전체 지역 일괄 선택
- 선택된 지역을 상단 가로 스크롤 태그로 실시간 표시 (각 태그 개별 삭제 가능)
- "초기화" / "적용하기" 버튼 → 적용 시 Maps 화면으로 `selectedRegions[]` 전달

**구현 내용 — SelectedRegions (바텀시트 탭)**
- 선택된 지역별 탭을 애니메이션 언더라인 탭바로 표시
- 탭 전환 시 `GET /api/location/filter?areaCodes=GANGNAM,...` 호출하여 지역 결과 갱신
- 지역 코드 매핑 상수: 24개 서울 지역명 → 영문 코드 변환 (`REGION_CODE_MAP`)

**핵심 기술 포인트**
- `navigation.navigate("BottomTabNavigator", { screen: "지도", params: { selectedRegions, resetRequested: true } })` 패턴으로 화면 간 상태 전달
- 현재 활성화된 지역 태그는 삭제 불가 처리 (토스트 메시지: "활성화된 지역입니다.")

---

### 3. 바 상세 및 북마크 (`src/BottomSheet/MenuListDetail.tsx`, `src/BottomSheet/SelectionListSheet.tsx`)

마커 또는 목록 항목 선택 시 바텀시트 내에서 바 상세 정보 표시 및 북마크 저장.

**구현 내용 — MenuListDetail**
- 바 사진 최대 2장 (가로 스크롤), 이름, 주소(클립보드 복사), 전화(탭-투-콜), 영업시간, SNS, 결제 정보
- 영업 상태 자동 계산: 자정 넘기는 영업시간도 처리 → "영업중" / "영업 전" / "영업 종료"
- 메뉴 카테고리 탭별 필터링 → 메뉴 이미지 + 가격 표시
- 북마크 토글: 저장된 경우 `DELETE /api/item`, 미저장 시 SelectionListSheet로 전환
- 마운트 시 `centerMapOnBar(x, y)` 호출 → 지도 자동 이동

**구현 내용 — SelectionListSheet**
- 사용자의 리스트 전체를 FlatList로 표시, 체크박스로 저장할 리스트 선택
- "새 리스트 만들기" → `CreateNewListScreen` 이동
- `POST /api/item` 으로 바 저장

**핵심 기술 포인트**
- `BottomSheetScrollView` + `ScrollView as GestureScrollView` 조합으로 제스처 핸들러 충돌 해결
- 영업시간 overnight span 처리 로직 직접 구현 (예: 23:00 ~ 02:00)

---

## 주요 API 연동

| 엔드포인트 | 용도 |
|-----------|------|
| `GET /api/location/nearby?x=&y=` | 현재 위치 주변 바 |
| `GET /api/location/filter?areaCodes=` | 지역 필터링 |
| `GET /api/search/keyword?search=` | 키워드 검색 |
| `GET /api/bar/{barId}` | 바 상세 (영업시간, 메뉴, 사진) |
| `GET /api/list/all` | 나의 리스트 전체 |
| `POST /api/item` | 바 북마크 저장 |
| `DELETE /api/item` | 북마크 삭제 |
| `POST /api/item/move` | 바 다른 리스트로 이동 |

---

## 트러블슈팅

### 마커 깜빡임 이슈
- **원인**: `react-native-maps`의 `<Marker>`는 이미지 로드 전까지 매 렌더마다 뷰를 재계산
- **해결**: `tracksViewChanges` 를 이미지 로드 완료 후 `false`로 전환하여 불필요한 재렌더 차단

### 바텀시트 내 스크롤 제스처 충돌
- **원인**: `@gorhom/bottom-sheet` 내부 제스처와 `ScrollView` 제스처가 충돌
- **해결**: `ScrollView`를 `react-native-gesture-handler`의 ScrollView로 교체, `simultaneousHandlers` 설정

### 지역 검색 후 핀 사라짐
- **원인**: `markerList` 상태 업데이트 타이밍 문제 (지역 필터 결과로 덮어쓰기)
- **해결**: 검색 결과 / 지역 필터 결과를 별도 상태(`barList`, `barData`)로 분리 관리

---

## 성과

- 앱스토어 **v1.0.1** 출시 (지도 기반 탐색 기능 포함)
- 지도 + 바텀시트 + 실시간 필터링을 통합한 탐색 UX 구현
- 총 담당 코드: 약 **1,800줄** (Maps.tsx 745줄 + RegionSelectScreen 316줄 + MenuListDetail 514줄 + SelectionListSheet 277줄)
