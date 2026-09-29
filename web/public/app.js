import { questions, toRequest } from './questions.js';
const app = document.querySelector('#app');
let step = 0;
let answers = {};
let busy = false;
let transitioning = false;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
async function changeStep(nextStep, reset = false) {
  if (transitioning || busy) return;
  transitioning = true;
  const direction = nextStep < step || reset ? -1 : 1;
  const oldHeight = app.getBoundingClientRect().height;
  const animate = !reducedMotion.matches && typeof app.animate === 'function';
  app.inert = true;
  try {
    if (animate) await app.animate([
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: `translateX(${-direction * 14}px)` },
    ], { duration: 120, easing: 'ease-in', fill: 'forwards' }).finished;
    if (reset) answers = {};
    step = nextStep;
    render();
    app.getAnimations().forEach(animation => animation.cancel());
    if (animate) {
      const newHeight = app.getBoundingClientRect().height;
      app.style.overflow = 'hidden';
      await app.animate([
        { opacity: 0, transform: `translateX(${direction * 18}px)`, height: `${oldHeight}px` },
        { opacity: 1, transform: 'translateX(0)', height: `${newHeight}px` },
      ], { duration: 240, easing: 'cubic-bezier(.22,1,.36,1)' }).finished;
    }
  } finally {
    app.getAnimations().forEach(animation => animation.cancel());
    app.style.overflow = '';
    app.inert = false;
    transitioning = false;
    focusTitle();
  }
}
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function focusTitle() { app.querySelector('h2')?.focus(); }
function render(moveFocus = false) {
  const q = questions[step];
  app.innerHTML = `<div class="step-line"><span>나의 취향 찾기</span><span>0${step + 1} <b>/ 05</b></span></div><progress max="5" value="${step + 1}" aria-label="질문 진행 단계"></progress><div class="steps">${questions.map((v, i) => `<span class="${i === step ? 'current' : ''}">${v.label}</span>`).join('')}</div><h2 tabindex="-1">${q.title}</h2><p class="hint">가장 끌리는 한 가지를 선택해주세요.</p><form><fieldset><legend class="sr-only">${q.title}</legend><div class="options">${q.options.map(([code, label, icon, desc]) => `<label class="option"><input type="radio" name="answer" value="${code}" ${answers[q.key] === code ? 'checked' : ''}><img src="/assets/${icon}" alt=""><span>${label}${desc ? `<small>${desc}</small>` : ''}</span><span class="check" aria-hidden="true"></span></label>`).join('')}</div></fieldset><div class="actions"><button type="button" class="back" ${step === 0 ? 'disabled' : ''}>← 이전</button><button class="primary" type="submit" ${answers[q.key] ? '' : 'disabled'}>${step === 4 ? '나의 칵테일 찾기' : '다음으로'} <span>→</span></button></div></form>`;
  app.querySelector('form').onchange = event => { answers[q.key] = event.target.value; app.querySelector('.primary').disabled = false; };
  app.querySelector('.back').onclick = () => changeStep(step - 1);
  app.querySelector('form').onsubmit = event => { event.preventDefault(); if (!answers[q.key] || transitioning) return; if (step < 4) changeStep(step + 1); else submit(); };
  if (moveFocus) focusTitle();
}
function resultActions() {
  app.querySelector('#restart').onclick = () => changeStep(0, true);
  app.querySelector('#edit').onclick = () => changeStep(0);
}
async function submit() {
  if (busy) return;
  busy = true;
  app.innerHTML = '<div class="message" role="status"><div class="spinner"></div><h2 tabindex="-1">취향에 맞는 한 잔을 찾고 있어요</h2><p>잠시만 기다려주세요.</p></div>';
  focusTitle();
  try {
    const response = await fetch(`/api/recommendation?${toRequest(answers)}`, { signal: AbortSignal.timeout(15000) });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || '추천을 불러오지 못했어요.');
    const d = body.data;
    const chips = questions.map(q => `<span>${escape(q.options.find(([code]) => code === answers[q.key])[1])}</span>`).join('');
    let image = '';
    if (d) {
      try { const url = new URL(d.imageUrlDetail || d.imageUrl); if (['https:', 'http:'].includes(url.protocol)) image = `<img class="result-image" src="${escape(url.href)}" alt="${escape(d.korName)}" referrerpolicy="no-referrer">`; } catch {}
    }
    app.innerHTML = `<p class="eyebrow">${body.mode === 'demo' ? 'DEMO PREVIEW · 고정 예시' : 'YOUR COCKTAIL'}</p>${image}<h2 tabindex="-1">${d ? escape(d.korName) : '딱 맞는 칵테일을 찾지 못했어요'}</h2>${d ? `<p class="english">${escape(d.engName)}</p><p class="description">${escape(d.originText)}</p>${d.base ? `<p class="detail">베이스 · ${escape(d.base)}</p>` : ''}${Number.isFinite(d.minAlcohol) && Number.isFinite(d.maxAlcohol) ? `<p class="detail">도수 · ${escape(d.minAlcohol)}–${escape(d.maxAlcohol)}%</p>` : ''}${Array.isArray(d.ingredients) ? `<h3>재료</h3><p class="description">${d.ingredients.map(escape).join(' · ')}</p>` : ''}` : '<p class="description">취향을 조금 바꿔 다시 찾아보세요.</p>'}<h3>내가 고른 취향</h3><div class="chips">${chips}</div><div class="actions"><button id="edit" class="back">취향 수정</button><button id="restart" class="primary">처음부터 다시</button></div>`;
    app.querySelector('.result-image')?.addEventListener('error', event => event.target.remove());
    resultActions(); focusTitle();
  } catch (error) {
    app.innerHTML = `<div role="alert"><p class="eyebrow">잠시만요</p><h2 tabindex="-1">추천을 가져오지 못했어요</h2><p class="description">${escape(error.name === 'TimeoutError' ? '응답 시간이 초과됐어요. 다시 시도해주세요.' : error.message)}</p><div class="actions"><button class="back">답변 수정</button><button class="primary">다시 시도</button></div></div>`;
    app.querySelector('.back').onclick = () => render(true);
    app.querySelector('.primary').onclick = submit;
    focusTitle();
  } finally { busy = false; }
}
render();
// Keep the same page design when embedded; the existing logo returns to the app.
if (window.ReactNativeWebView) {
  document.querySelector('.brand').addEventListener('click', event => {
    event.preventDefault();
    window.ReactNativeWebView.postMessage('onz:close');
  });
  window.addEventListener('onz:native-back', () => {
    if (transitioning || busy) return;
    if (app.querySelector('form') && step > 0) changeStep(step - 1);
    else window.ReactNativeWebView.postMessage('onz:close');
  });
}
fetch('/api/config').then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(config => { document.querySelector('#mode').textContent = config.mode === 'demo' ? '데모 모드 · 결과는 고정 예시입니다' : '맞춤 추천 · 나를 위한 한 잔'; }).catch(() => { document.querySelector('#mode').textContent = '연결 상태를 확인할 수 없습니다'; });
