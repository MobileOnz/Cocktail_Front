// Ported from RecommendationScreen.tsx and VideoViewModel.tsx.
export const questions = [
  { key: 'flavor', label: '맛', title: '오늘은 어떤 맛이 끌리세요?', options: [
    ['SWEET', '달콤한 맛', 'sweet.png'], ['SPARKLING', '청량 · 스파클링', 'questionSparkle.png'], ['CITRUS', '상큼 · 시트러스', 'questionCitrus.png'], ['TROPICAL', '과일향 · 트로피컬', 'questionTropical.png'], ['BITTER', '쌉싸름 · 비터', 'questionBitter.png'], ['SPICY', '스파이시 · 따뜻한', 'questionSpicy.png'], ['HERBAL', '허브 · 프레시', 'questionHerbal.png'],
  ] },
  { key: 'mood', label: '분위기', title: '어떤 순간에 함께할까요?', options: [
    ['MEAL_TIME', '식전 · 식후', 'Dining.png'], ['ROMANTIC', '데이트 · 로맨틱', 'Romantic.png'], ['PARTY', '파티 · 여럿이', 'Together.png'], ['CASUAL', '집에서 간단히', 'Casual.png'], ['MODERN', '세련된 · 모던', 'Modern.png'], ['CLASSIC', '클래식 · 전통', 'Tradition.png'],
  ] },
  { key: 'season', label: '계절', title: '계절도 함께 반영해드릴까요?', options: [
    ['SPRING', '봄', 'Spring.png'], ['SUMMER', '여름', 'hotWeather.png'], ['AUTUMN', '가을', 'Autumn.png'], ['WINTER', '겨울', 'Winter.png'], ['ALL', '계절은 상관없어요', 'None.png'],
  ] },
  { key: 'style', label: '스타일', title: '어떤 스타일을 시도해보고 싶으세요?', options: [
    ['LIGHT', '라이트', 'lightCocktail.png', '달콤하고 가볍게 즐기는 한 잔'], ['STANDARD', '스탠다드', 'StandardCocktail.png', '기본에 충실한 익숙한 매력'], ['SPECIAL', '스페셜', 'SpecialCocktail.png', '색다른 조합, 새로운 발견'], ['STRONG', '스트롱', 'StrongCocktail.png', '강렬한 맛과 깊은 여운'], ['CLASSIC', '클래식', 'ClassicCocktail.png', '오래도록 사랑받는 정통 스타일'],
  ] },
  { key: 'abvBand', label: '도수', title: '어느 정도 도수가 좋으세요?', options: [
    ['LOW', '약함 · ABV 5–12%', 'weakWine.png', '부담 없이 가볍게'], ['MEDIUM', '보통 · ABV 13–25%', 'normalWine.png', '적당한 밸런스를 즐기고 싶어요'], ['HIGH', '강함 · ABV 26% 이상', 'strongWine.png', '진하고 묵직한 한 잔'],
  ] },
];

export function validateAnswers(answers) {
  return !!answers && Object.keys(answers).length === questions.length && questions.every(q => q.options.some(([code]) => code === answers[q.key]));
}

export function toRequest(answers) {
  if (!validateAnswers(answers)) throw new Error('다섯 가지 질문에 모두 답해주세요.');
  return new URLSearchParams(questions.map(q => [q.key, answers[q.key]]));
}
