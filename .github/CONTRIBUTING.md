# 협업 / GitHub 작업 컨벤션 (Front)

> Notion "GitHub 작업 방식 정리" 문서를 기준으로 정리한 레포 컨벤션입니다.
> FE는 앱스토어 배포 파이프라인 특성상 **브랜치 운영만 별도**이며,
> 이슈 / PR / 브랜치 네이밍 규칙은 공통 컨벤션을 그대로 따릅니다.

## 1. 브랜치 운영 (FE 전용)
- **`main`**: 프로덕션 배포 기준 (Google Play / App Store) — `cd-prod.yml`
- **`Onz_Android`**: QA 배포 (Firebase App Distribution / TestFlight) — `cd-qa.yml`
- **`Onz_iOS`**: iOS QA / 빌드
- 작업 브랜치는 위 배포 브랜치(주로 `main`)에서 분기하고, 완료 후 PR로 머지한다.

> 참고: BE(`Cocktail_backend`)는 `dev` → `main` 흐름을 사용하지만,
> FE는 앱 빌드/배포 트리거가 `main`·`Onz_Android`에 직접 걸려 있어 별도 `dev`를 두지 않는다.

## 2. 이슈 기반 개발
- 모든 작업은 GitHub Issue로 시작한다. (`.github/ISSUE_TEMPLATE` 사용)
- 이슈에 **Assignees**를 등록해 작업 중임을 표시한다 → 동일 작업 중복 방지.
- 이슈에는 작업 목적/범위/구현할 기능/완료 기준 등을 자유롭게 포함한다.

## 3. 브랜치 네이밍
- 형식: **`작업유형/#이슈번호`** (마지막에 반드시 이슈 번호 포함)
- 예: `feat/#33`, `fix/#41`, `refactor/#62`, `docs/#12`, `test/#28`, `ops/#55`
- 기존 `feature/`, `ui/` 접두사 대신 아래 표준 유형을 사용한다.
- CI(`ci-branch.yml`)는 표준 유형 브랜치 push 시 동작한다.

| 작업 유형 | 설명 | 예시 |
|---|---|---|
| feat | 신규 기능 개발 | `feat/#33` |
| fix | 버그 수정 | `fix/#41` |
| refactor | 코드 리팩토링 | `refactor/#62` |
| docs | 문서 수정 | `docs/#12` |
| test | 테스트 코드 작성 | `test/#28` |
| ops | 배포 / 인프라 / 운영 | `ops/#55` |

## 4. 작업 흐름

```
Issue 작성
  ↓
Assignees 등록
  ↓
배포 브랜치(main 등) 기준으로 작업 브랜치 생성
  ↓
개발 진행
  ↓
Pull Request 생성
  ↓
리뷰 후 머지
  ↓
배포 (Onz_Android push → QA 배포 / main push → 프로덕션 배포)
```
