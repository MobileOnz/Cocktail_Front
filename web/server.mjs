import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { recommend } from './recommendation.mjs';
import { validateAnswers } from './public/questions.js';

const root = path.resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.otf': 'font/otf' };
const json = (res, status, data) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); };
export const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (req.method !== 'GET') return json(res, 405, { error: 'GET 요청만 지원합니다.' });
    if (url.pathname === '/api/config') return json(res, 200, { mode: process.env.API_BASE_URL ? 'api' : 'demo' });
    if (url.pathname === '/api/recommendation') {
      const answers = Object.fromEntries(url.searchParams);
      if (url.searchParams.size !== 5 || !validateAnswers(answers)) return json(res, 400, { error: '질문에 대한 응답이 올바르지 않아요.' });
      try {
        return json(res, 200, await recommend(answers, { baseUrl: process.env.API_BASE_URL, authorization: process.env.API_AUTHORIZATION }));
      } catch (error) {
        return json(res, 502, { error: error.name === 'TimeoutError' ? '응답 시간이 초과됐어요. 다시 시도해주세요.' : error.message === 'fetch failed' ? '추천 서버에 연결할 수 없어요.' : error.message });
      }
    }
    const target = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!target.startsWith(root + path.sep) && target !== root) return json(res, 403, { error: '접근할 수 없습니다.' });
    const data = await readFile(target);
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    res.end(data);
  } catch { json(res, 404, { error: '페이지를 찾을 수 없습니다.' }); }
});
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 5173);
  server.listen(port, process.env.HOST || '127.0.0.1', () => console.log(`Cocktail Web: http://${process.env.HOST || '127.0.0.1'}:${port}`));
}
