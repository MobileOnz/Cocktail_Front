/**
 * 앱 업데이트 확인.
 *
 * 서버(GET /api/v2/app/version)가 플랫폼별 최신·최소 버전을 준다.
 *   현재 < minVersion    → 'force'  (닫을 수 없는 업데이트 화면)
 *   현재 < latestVersion → 'notice' (닫을 수 있는 안내, 같은 버전은 한 번만)
 *
 * 확인이 실패하면(오프라인·옛 서버) 아무것도 띄우지 않는다. 업데이트 안내 때문에
 * 앱을 못 쓰게 되면 안 된다.
 */
import axios from 'axios';
import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL} from '@env';
import type {Envelope} from './api';

const BASE_URL = API_BASE_URL || 'http://onz-cocktail.kr/onz';
const DISMISSED_KEY = 'appUpdate.dismissedVersion';

export interface AppVersionInfo {
  platform: string;
  latestVersion: string;
  minVersion: string;
  storeUrl: string;
}

export type UpdateCheck =
  | {kind: 'none'}
  | {kind: 'notice' | 'force'; latestVersion: string; storeUrl: string};

/** '2.10.0' > '2.9.1'. 숫자가 아닌 조각은 0 으로 본다. a<b 면 음수. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(n => parseInt(n, 10) || 0);
  const pb = b.split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) {
      return d;
    }
  }
  return 0;
}

/** 순수 판정. dismissed 는 사용자가 '나중에'를 누른 최신 버전. */
export function decideUpdate(
  current: string,
  info: AppVersionInfo,
  dismissed: string | null,
): UpdateCheck {
  const target = {latestVersion: info.latestVersion, storeUrl: info.storeUrl};
  if (compareVersions(current, info.minVersion) < 0) {
    return {kind: 'force', ...target};
  }
  if (compareVersions(current, info.latestVersion) < 0 && dismissed !== info.latestVersion) {
    return {kind: 'notice', ...target};
  }
  return {kind: 'none'};
}

export async function checkAppUpdate(): Promise<UpdateCheck> {
  try {
    const res = await axios.get<Envelope<AppVersionInfo>>(`${BASE_URL}/api/v2/app/version`, {
      params: {platform: Platform.OS},
      timeout: 5000,
    });
    if (res.data?.code !== 1 || !res.data.data) {
      return {kind: 'none'};
    }
    const dismissed = await AsyncStorage.getItem(DISMISSED_KEY).catch(() => null);
    return decideUpdate(DeviceInfo.getVersion(), res.data.data, dismissed);
  } catch {
    return {kind: 'none'};
  }
}

export function dismissUpdateNotice(latestVersion: string): void {
  AsyncStorage.setItem(DISMISSED_KEY, latestVersion).catch(() => {});
}
