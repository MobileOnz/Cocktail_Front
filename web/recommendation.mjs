import { toRequest } from './public/questions.js';

export async function recommend(answers, { baseUrl, authorization, fetcher = fetch } = {}) {
  const query = toRequest(answers);
  if (!baseUrl) return { mode: 'demo', data: {
    id: 0, korName: '모히토', engName: 'Mojito', base: '화이트 럼',
    originText: '민트와 라임, 탄산이 어우러지는 상쾌한 한 잔. 이 카드는 화면 확인을 위한 고정 예시이며, 선택한 취향으로 계산한 추천 결과가 아닙니다.',
    ingredients: ['화이트 럼', '라임', '민트', '설탕', '탄산수'],
  } };
  const base = new URL(baseUrl);
  if (!['http:', 'https:'].includes(base.protocol) || base.search || base.hash) throw new Error('API 주소 설정을 확인해주세요.');
  const response = await fetcher(`${base.href.replace(/\/$/, '')}/api/v2/cocktails/recommendation?${query}`, {
    headers: { Accept: 'application/json', ...(authorization ? { Authorization: authorization } : {}) },
    signal: AbortSignal.timeout(10000), redirect: 'error',
  });
  if (!response.ok) {
    if ([401, 403].includes(response.status)) throw new Error('추천 서버 인증이 필요합니다. 서버 인증 설정을 확인해주세요.');
    throw new Error('추천 서버에서 응답을 받지 못했어요. 잠시 후 다시 시도해주세요.');
  }
  const body = await response.json();
  if (!Object.hasOwn(body ?? {}, 'data') || (body.data !== null && (typeof body.data !== 'object' || typeof body.data.korName !== 'string'))) throw new Error('추천 서버의 응답 형식이 올바르지 않아요.');
  return { mode: 'api', data: body.data };
}
