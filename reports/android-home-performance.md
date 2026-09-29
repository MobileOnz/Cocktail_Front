# Android 홈 스크롤 확인 (2026-09-24)

환경: emulator-5554, sdk_gphone16k_arm64, API 37, 1080×2400, Metro 연결 개발 빌드.
실기기 릴리스 성능 또는 React 리렌더 프로파일 결과가 아니다.

홈 원격 이미지에 Android resizeMethod="resize"를 적용했다.
기존 auto는 큰 원본의 표시 크기 축소를 보장하지 않는다.
https://reactnative.dev/docs/0.78/image#resizemethod

| 지표 | 변경 전 | 변경 후 1회 | 변경 후 2회 |
| --- | ---: | ---: | ---: |
| 프레임 p50 | 133ms | 17ms | 20ms |
| 프레임 p95 | 150ms | 19ms | 24ms |
| 느린 bitmap upload | 39 | 0 | 0 |
| 이미지 GPU texture | 143.86MB | 53.32MB | 53.32MB |
| 프레임 수 | 39 | 81 | 152 |

동일 입력을 사용했지만 프레임 수와 jank/legacy-jank 판정은 크게 변동했다.
따라서 고정 FPS 또는 전체 버벅임 해소로 해석하지 않는다.
이미지 업로드 지연과 GPU 메모리 감소가 관측된 개선이다.
캐시, 개발 모드, 에뮬레이터 부하의 영향이 있으며 실기기 재검증이 필요하다.

## 재현

1080×2400 Android 기기에서 홈 맨 위로 이동하고 이미지 로딩이 끝난 뒤 실행한다.
좌표는 다른 해상도에서는 맞춰야 한다. 시작 화면이 홈인지 먼저 확인한다.

```sh
adb -s emulator-5554 shell 'dumpsys gfxinfo com.cocktail_front reset >/dev/null; input swipe 500 1900 500 500 600; input swipe 500 1900 500 500 600; input swipe 500 500 500 1900 600; input swipe 500 500 500 1900 600; dumpsys gfxinfo com.cocktail_front'
```

홈 사진·설명 아래 맞춤추천 버튼 표시와 탭 후 소개 화면 이동을 캡처로 확인했다.
52 최소 높이, 유동 높이, 접근성 이름·역할, Android 리플과 누름 피드백을 적용했다.
피드 로딩/오류 상태에도 버튼을 표시한다. 해당 상태와 iOS는 코드 검토만 수행했다.

검증: git diff --check 통과. 파일 ESLint는 기존 미사용 renderGuideCard 오류 1건이 있다.
해당 no-unused-vars 규칙을 제외한 ESLint는 통과했다.
리스트 교체, memoization, 새 의존성은 추가하지 않았다.
