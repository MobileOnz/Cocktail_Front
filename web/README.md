# Cocktail Web

React Native 앱의 칵테일 맞춤 추천 흐름을 분리한 독립 웹 프로젝트입니다. Node.js 22 이상에서 외부 패키지 설치 없이 실행합니다. 기존 앱 폴더가 없어도 동작합니다.

## 실행

```powershell
cd web
npm.cmd start
```

브라우저에서 http://127.0.0.1:5173 을 여세요. 개발 중 서버 자동 재시작은 `npm.cmd run dev`, 검증은 `npm.cmd test`를 사용합니다. 화면 변경은 브라우저를 새로고침하면 반영됩니다.

### 로컬 웹뷰 접속

실제 서버 연결은 `.env.example`을 `.env`로 복사한 뒤 `API_BASE_URL=https://onz-cocktail.kr/onz`를 설정하세요. 실제 휴대폰에서 접속하려면 `HOST=0.0.0.0`도 설정하세요. 로컬 `.env`는 저장소에 포함하지 않습니다.

- PC 브라우저: `http://127.0.0.1:5173`
- Android Studio 기본 에뮬레이터: `http://10.0.2.2:5173`
- 같은 Wi-Fi의 실제 휴대폰: `http://192.168.45.181:5173` (현재 PC Wi-Fi 주소이며 네트워크 변경 시 달라집니다.)
- 유선 네트워크를 통한 접속: `http://192.168.55.83:5173`

앱의 기존 추천 시작 버튼은 `RecommendationScreen` 경로에서 `RecommendationWebScreen.tsx`를 엽니다. 웹 디자인과 애니메이션을 그대로 사용하며, Android 뒤로가기는 이전 질문으로 이동하고 첫 질문에서는 앱으로 돌아갑니다. 웹 상단 ONZ 로고를 눌러도 앱으로 돌아갑니다.

Android 개발 빌드의 기본 주소는 `http://10.0.2.2:5173`, iOS는 `http://localhost:5173`입니다. 실제 휴대폰에서는 `Cocktail_Front/.env`에 `RECOMMENDATION_WEB_URL=http://192.168.45.181:5173`을 지정하고 Metro를 재시작하세요. 실제 휴대폰의 `localhost`는 PC가 아닌 휴대폰 자신입니다. 배포 빌드는 로컬 주소를 기본으로 사용하지 않으므로 배포된 HTTPS 웹 주소를 설정해야 합니다. iOS 빌드는 Mac에서 `bundle exec pod install` 후 재빌드하세요.

Android debug manifest는 이미 로컬 HTTP를 허용합니다. 같은 네트워크에서도 접속되지 않으면 PC 방화벽의 5173 포트 허용 여부를 확인하세요. 기존 앱의 로그인 진입 조건은 유지됩니다.

## 실제 추천 서버 연결

`.env.example`을 `.env`로 복사하고 `API_BASE_URL`에 기존 서버 주소를 입력한 후 서버를 재시작하세요. 예를 들어 주소가 `https://your-api.example/onz`이면 `/onz/api/v2/cocktails/recommendation`을 호출합니다. `.env`는 공개하거나 커밋하지 않습니다.

- 메서드: `GET`
- 쿼리: `flavor`, `mood`, `season`, `style`, `abvBand`
- 응답: `{ "data": { "korName": "...", "engName": "...", ... } }` 또는 `{ "data": null }`
- 서버 사이에서 요청하므로 브라우저의 교차 출처 요청 설정에 의존하지 않습니다.
- `API_AUTHORIZATION`은 필요한 경우 로컬 개발용 Authorization 헤더 값을 그대로 전달합니다. 공개 서비스에서는 사용자별 로그인·세션 연동이 별도로 필요하며 개인 토큰을 공용 인증으로 사용하지 마세요.
- 기본 실행 주소는 로컬 전용입니다. 배포 시 호스팅 환경에 맞춰 `HOST`, `PORT`를 설정하고 HTTPS를 구성하세요.

API 주소가 없으면 **고정 모히토 예시를 표시하는 데모 모드**입니다. 취향에 따른 계산을 하지 않으며 원본 알고리즘의 결과가 아닙니다. 실제 API 실패 시 데모로 바꾸지 않고 오류와 재시도 버튼을 보여줍니다.

## 파일과 수정 위치

- `public/questions.js`: 5단계 질문, 원본 응답 코드, 입력 검증
- `public/app.js`: 질문 선택, 이전 단계, 결과, 빈 결과, 재시도 흐름
- `public/style.css`: 반응형 웹 스타일
- `recommendation.mjs`: 기존 추천 API 어댑터와 고정 데모 데이터
- `server.mjs`: 정적 웹 서버와 추천 API 프록시
- `public/assets/`: 기존 앱에서 복사한 질문 아이콘과 Pretendard 폰트

원본 `RecommendationScreen.tsx`, `VideoViewModel.tsx`, `RecommendCocktailDataSource.tsx`, `CocktailRec.tsx`를 기준으로 분리했습니다. 현재 원본 폴더에는 서버의 추천 계산 알고리즘·가중치·칵테일 데이터베이스가 없으므로 해당 로직은 이전하지 않았습니다. 백엔드 소스가 제공되면 `recommendation.mjs`의 호출 경계를 기준으로 연결하거나 계산 로직을 추가할 수 있습니다. 앱 로그인, 북마크, 분석 이벤트, 앱 내비게이션은 이번 독립 웹의 범위에 포함하지 않았습니다.

`npm.cmd test`는 응답 코드, 아이콘 존재, API 요청 계약, 빈 응답·인증 오류·시간 초과, 정적 파일 및 HTTP 경로를 확인합니다. 실제 백엔드 연동과 브라우저 화면은 별도 확인이 필요합니다.
