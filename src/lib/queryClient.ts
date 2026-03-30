import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// MMKV를 lazy하게 초기화 (모듈 로딩 시점에 네이티브 모듈이 준비되지 않을 수 있음)
const getMMKVStorage = () => {
  try {
    const { MMKV } = require('react-native-mmkv');
    const storage = new MMKV({ id: 'query-cache' });
    return {
      setItem: (key: string, value: string) => storage.set(key, value),
      getItem: (key: string) => storage.getString(key) ?? null,
      removeItem: (key: string) => storage.delete(key),
    };
  } catch (e) {
    console.warn('[QueryClient] MMKV 초기화 실패, 메모리 캐시만 사용합니다.', e);
    // MMKV 실패 시 인메모리 fallback
    const map = new Map<string, string>();
    return {
      setItem: (key: string, value: string) => map.set(key, value),
      getItem: (key: string) => map.get(key) ?? null,
      removeItem: (key: string) => map.delete(key),
    };
  }
};

export const persister = createSyncStoragePersister({
  storage: getMMKVStorage(),
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
    },
  },
});
