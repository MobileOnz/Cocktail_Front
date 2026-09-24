import {runInNewContext} from 'vm';
import {recommendationWebTheme} from '../src/Screens/recommendationWebTheme';

test('applies app theme once and updates accessibility settings without replacing answers', () => {
  const nodes = new Map();
  const answers = {taste: 'SWEET'};
  const postMessage = jest.fn();
  const document = {
    documentElement: {dataset: {theme: 'light'}},
    querySelector: () => answers,
    getElementById: (id: string) => nodes.get(id),
    createElement: () => ({id: '', textContent: ''}),
    head: {appendChild: (node: {id: string}) => nodes.set(node.id, node)},
  };
  const context = {document, window: {ReactNativeWebView: {postMessage}}};
  runInNewContext(recommendationWebTheme(1, false), context);
  runInNewContext(recommendationWebTheme(1.5, true), context);
  expect(nodes.size).toBe(1);
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(nodes.get('onz-native-theme').textContent).toContain(
    'font-size: 24px',
  );
  expect(nodes.get('onz-native-theme').textContent).toContain(
    'animation: none !important',
  );
  expect(answers).toEqual({taste: 'SWEET'});
  expect(postMessage).toHaveBeenLastCalledWith('onz:ready');
  document.querySelector = () => null as never;
  postMessage.mockClear();
  runInNewContext(recommendationWebTheme(1, false), context);
  expect(postMessage).not.toHaveBeenCalled();
});
