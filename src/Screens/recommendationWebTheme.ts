import {night} from '../lib/theme';

// App-only presentation for the hosted recommendation flow. Keep selectors in
// sync with /recommend/; the website owns questions, answers and API requests.
export function recommendationWebTheme(
  fontScale: number,
  reducedMotion: boolean,
) {
  const css = `
    :root, :root[data-theme="light"] {
      color-scheme: dark;
      --bg: ${night.ink}; --ink: ${night.text}; --muted: ${night.textDim};
      --accent: ${night.accent}; --on-accent: ${night.onAccent};
      --surface: ${night.surface}; --surface-high: ${night.surfaceHigh};
      --selected: ${night.surfaceHigh}; --line: ${night.line};
      --safe-top: 0px; --safe-bottom: 0px;
      font-size: ${16 * fontScale}px;
    }
    body { background: var(--bg); -webkit-text-size-adjust: 100%; }
    .header { display: none; }
    main { max-width: 640px; }
    #progress-region { padding: 16px 20px 0; }
    .step-line { font-size: .8125rem; }
    .progress { height: 4px; margin-top: 12px; }
    .question-body, .result-body { padding: 24px 20px; }
    .question-body { display: block; }
    .question-intro { padding: 0; margin-bottom: 24px; }
    .glass-mark, .question-intro .eyebrow { display: none; }
    h1, .recommendation-info h2 {
      font-family: var(--font-sans); font-weight: 700;
      letter-spacing: -.035em; line-height: 1.35;
    }
    h1 { font-size: 1.75rem; margin-bottom: 12px; }
    .hint, .description { font-size: .9375rem; line-height: 1.6; }
    .options { padding: 0; gap: 10px; }
    .option {
      min-height: 60px; padding: 14px 16px; gap: 12px;
      border: 1px solid var(--line); border-radius: 10px;
      background: var(--surface); font-size: 1rem; animation: none;
    }
    .option-index { display: none; }
    .option.selected { border-color: var(--accent); background: var(--selected); }
    .option small { font-size: .8125rem; }
    .check { opacity: 1; transform: none; background: transparent; border-color: var(--muted); }
    .check:after { visibility: hidden; }
    .selected .check { background: var(--accent); border-color: var(--accent); }
    .selected .check:after { visibility: visible; }
    .actions { background: var(--bg); padding: 12px 20px 16px; gap: 12px; }
    .primary { min-height: 52px; max-width: none; border-radius: 10px; padding: 14px 16px; font-size: 1rem; }
    .primary:has(.button-arrow) { justify-content: center; }
    .button-arrow { display: none; }
    .back, summary { min-height: 48px; font-size: .9375rem; }
    .recommendation-list { gap: 32px; margin-top: 28px; }
    .recommendation-card { grid-template-columns: 1fr; gap: 16px; }
    .result-photo { padding: 0; border: 0; border-radius: 16px; }
    .recommendation-info { padding: 0; }
    .recommendation-info h2 { font-size: 1.5rem; }
    .recommendation-info .english { font-size: 1rem; }
    .eyebrow, .chips span { font-size: .8125rem; }
    .detail, .reasons, .message p { font-size: .9375rem; }
    h2, h3 { font-size: 1rem; }
    .loading-screen .loading-film { width: 100%; height: 100%; border: 0; border-radius: 0; box-shadow: none; }
    .video-toggle { min-height: 48px; font-size: .8125rem; }
    .film-copy h1 { font-family: var(--font-sans); font-size: 1.5rem; }
    .film-copy > p:not(.film-eyebrow) { font-size: .9375rem; }
    ${
      reducedMotion
        ? '*,:before,:after { animation: none !important; transition: none !important; } .pour-video { display:none; } .film-still { display:block; }'
        : ''
    }
  `;
  return `
    (function () {
      if (!document.querySelector('#app')) { return; }
      document.documentElement.dataset.theme = 'dark';
      var style = document.getElementById('onz-native-theme');
      if (!style) {
        style = document.createElement('style');
        style.id = 'onz-native-theme';
        document.head.appendChild(style);
      }
      style.textContent = ${JSON.stringify(css)};
      window.ReactNativeWebView.postMessage('onz:ready');
    })(); true;
  `;
}
