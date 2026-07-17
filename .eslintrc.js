module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // 색상은 src/lib/theme.ts 토큰만 사용한다. 기존 화면의 하드코딩 hex 는 점진 이관 중이라
    // error 로 올리면 CI 가 전부 깨지므로 warn 으로 두고, 신규 코드에서 늘리지 않는 것이 규칙.
    'react-native/no-color-literals': 'warn',
  },
};
