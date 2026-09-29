import { test } from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { questions, toRequest, validateAnswers } from './public/questions.js';
import { recommend } from './recommendation.mjs';
import { server } from './server.mjs';

const answers = { flavor: 'HERBAL', mood: 'CASUAL', season: 'SUMMER', style: 'LIGHT', abvBand: 'LOW' };
test('original API codes and all question assets are preserved', async () => {
  assert.deepEqual(questions.map(q => q.options.length), [7, 6, 5, 5, 3]);
  assert.equal(toRequest(answers).toString(), 'flavor=HERBAL&mood=CASUAL&season=SUMMER&style=LIGHT&abvBand=LOW');
  for (const q of questions) for (const [code, , icon] of q.options) {
    assert.equal(validateAnswers({ ...answers, [q.key]: code }), true);
    await access(new URL(`./public/assets/${icon}`, import.meta.url));
  }
  assert.throws(() => toRequest({ ...answers, flavor: 'unknown' }));
  assert.throws(() => toRequest({ flavor: 'SWEET' }));
  assert.throws(() => toRequest({ ...answers, extra: 'value' }));
});
test('demo is explicit and never calls backend', async () => {
  const result = await recommend(answers, { fetcher: () => { throw new Error('Unexpected call'); } });
  assert.equal(result.mode, 'demo');
  assert.equal(result.data.korName, '모히토');
});
test('backend adapter preserves base path, authorization and response', async () => {
  const result = await recommend(answers, { baseUrl: 'https://example.com/onz/', authorization: 'test-token', fetcher: async (url, options) => {
    assert.equal(new URL(url).pathname, '/onz/api/v2/cocktails/recommendation');
    assert.deepEqual(Object.fromEntries(new URL(url).searchParams), answers);
    assert.equal(options.headers.Authorization, 'test-token');
    return Response.json({ data: { korName: '테스트' } });
  } });
  assert.deepEqual(result, { mode: 'api', data: { korName: '테스트' } });
});
test('empty results, auth errors, malformed data and timeouts remain distinct', async () => {
  const call = fetcher => recommend(answers, { baseUrl: 'https://example.com', fetcher });
  assert.equal((await call(async () => Response.json({ data: null }))).data, null);
  await assert.rejects(call(async () => new Response('', { status: 401 })), /인증/);
  await assert.rejects(call(async () => new Response('', { status: 500 })), /응답/);
  await assert.rejects(call(async () => Response.json({})), /형식/);
  await assert.rejects(call(async () => { throw new DOMException('timeout', 'TimeoutError'); }), { name: 'TimeoutError' });
});
test('HTTP serves standalone web, rejects invalid answers and protects private files', async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await fetch(origin);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /ONZ/);
    assert.equal((await fetch(`${origin}/assets/sweet.png`)).status, 200);
    assert.equal((await fetch(`${origin}/api/recommendation?flavor=SWEET`)).status, 400);
    assert.equal((await fetch(`${origin}/api/recommendation?${toRequest(answers)}&flavor=SWEET`)).status, 400);
    assert.equal((await fetch(`${origin}/.env`)).status, 404);
    assert.equal((await fetch(`${origin}/api/config`, { method: 'POST' })).status, 405);
    if (!process.env.API_BASE_URL) assert.equal((await (await fetch(`${origin}/api/recommendation?${toRequest(answers)}`)).json()).mode, 'demo');
  } finally { await new Promise(resolve => server.close(resolve)); }
});
