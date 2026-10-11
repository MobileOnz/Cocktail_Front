import {compareVersions, decideUpdate} from '../src/lib/appUpdate';

jest.mock('react-native-device-info', () => ({getVersion: () => '2.1.0'}));
jest.mock('@react-native-async-storage/async-storage', () => ({}));
jest.mock('@env', () => ({API_BASE_URL: ''}), {virtual: true});

const info = (latestVersion: string, minVersion: string) => ({
  platform: 'ios',
  latestVersion,
  minVersion,
  storeUrl: 'https://apps.apple.com/x',
});

describe('compareVersions', () => {
  it('자리마다 숫자로 비교한다', () => {
    expect(compareVersions('2.10.0', '2.9.1')).toBeGreaterThan(0);
    expect(compareVersions('2.0.5', '2.1.0')).toBeLessThan(0);
    expect(compareVersions('2.1', '2.1.0')).toBe(0);
  });
});

describe('decideUpdate', () => {
  it('최소 버전보다 낮으면 강제', () => {
    expect(decideUpdate('2.0.5', info('2.2.0', '2.1.0'), null).kind).toBe('force');
  });
  it('최신보다 낮으면 안내', () => {
    expect(decideUpdate('2.1.0', info('2.2.0', '0.0.0'), null).kind).toBe('notice');
  });
  it('나중에를 누른 버전은 다시 안내하지 않는다', () => {
    expect(decideUpdate('2.1.0', info('2.2.0', '0.0.0'), '2.2.0').kind).toBe('none');
    expect(decideUpdate('2.1.0', info('2.3.0', '0.0.0'), '2.2.0').kind).toBe('notice');
  });
  it('나중에를 눌렀어도 강제는 뜬다', () => {
    expect(decideUpdate('2.0.5', info('2.2.0', '2.1.0'), '2.2.0').kind).toBe('force');
  });
  it('최신이면 아무것도 없다', () => {
    expect(decideUpdate('2.2.0', info('2.2.0', '2.0.0'), null).kind).toBe('none');
  });
});
