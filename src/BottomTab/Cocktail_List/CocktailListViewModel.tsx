import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { di } from '../../DI/Container';
import { IHomeCocktailRepository } from '../../model/repository/HomeCocktailRepository';
import instance from '../../tokenRequest/axios_interceptor';
import { useNavigation } from '@react-navigation/native';
import { getToken } from '../../tokenRequest/Token';
import Toast from 'react-native-toast-message';
import perf from '@react-native-firebase/perf';
import { trackViewHomeOncePerSession } from '../../analytics/eventProperty';

type UseSearchResultDeps = {
  repository?: IHomeCocktailRepository;
};

// 홈 데이터를 한 번에 fetch하는 함수
const fetchHomeData = async (repository: IHomeCocktailRepository) => {
  const trace = await perf().newTrace('HomeScreen_Load');
  await trace.start();
  try {
    const [randomCocktail, newCocktail, bestCocktail, refreshList, intermediateList, beginnerList] =
      await Promise.all([
        repository.random(),
        repository.newCocktail(),
        repository.bestCocktail(),
        repository.refresh(),
        repository.intermediate(),
        repository.beginner(),
      ]);
    await trace.stop();
    return { randomCocktail, newCocktail, bestCocktail, refreshList, intermediateList, beginnerList };
  } catch (e) {
    await trace.stop();
    throw e;
  }
};

export const useHomeViewModel = (deps?: UseSearchResultDeps) => {
  const repository = deps?.repository ?? di.homeCocktailRepository;
  const queryClient = useQueryClient();
  const navigation = useNavigation<any>();
  const [isScrolled, setIsScrolled] = useState(false);
  const hasTrackedHome = useRef(false);

  // ─── useQuery: 캐시된 데이터 즉시 ���시 후 백그라운드에서 최신 ��이터 fetch ───
  const { data, isLoading, error } = useQuery({
    queryKey: ['homeData'],
    queryFn: () => fetchHomeData(repository),
    staleTime: 1000 * 60 * 60, // 1시간
  });

  useEffect(() => {
    if (!hasTrackedHome.current && !isLoading) {
      hasTrackedHome.current = true;
      getToken().then(t => {
        trackViewHomeOncePerSession({
          userType: data ? 'return' : 'new',
          loginStatus: t ? 'logged_in' : 'guest',
        });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // 북마크 토글 (낙관적 UI)
  const bookmarked = async (cocktailId: number) => {
    // 캐시에서 직접 북마크 상태 토글
    queryClient.setQueryData(['homeData'], (old: typeof data) => {
      if (!old) { return old; }
      const toggle = (list: any[]) =>
        list.map(item =>
          item.id === cocktailId ? { ...item, isBookmarked: !item.isBookmarked } : item,
        );
      return {
        ...old,
        bestCocktail: toggle(old.bestCocktail),
        newCocktail: toggle(old.newCocktail),
        refreshList: toggle(old.refreshList),
        beginnerList: toggle(old.beginnerList),
        intermediateList: toggle(old.intermediateList),
      };
    });

    try {
      await instance.post(`/api/v2/cocktails/${cocktailId}/bookmarks`);
    } catch (e: any) {
      console.error('북마크 처리 중 에러:', e);
      // 실패 시 캐시 무효화 → 서버에서 최신 데이터 재요청
      queryClient.invalidateQueries({ queryKey: ['homeData'] });
    }
  };

  const bookMarkCheck = async () => {
    const token = await getToken();
    if (!token) {
      Toast.show({ type: 'error', text1: '로그인이 필요한 서비스 입니다.' });
      return;
    }
    navigation.navigate('CocktailBoxScreen');
  };

  const handleScroll = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const isTop = offsetY <= 10;
    if (!isTop && !isScrolled) { setIsScrolled(true); }
    else if (isTop && isScrolled) { setIsScrolled(false); }
  }, [isScrolled]);

  return {
    bookmarked,
    randomCocktail: data?.randomCocktail,
    bestCocktail: data?.bestCocktail ?? [],
    newCocktail: data?.newCocktail ?? [],
    refreshList: data?.refreshList ?? [],
    beginnerList: data?.beginnerList ?? [],
    intermediateList: data?.intermediateList ?? [],
    loading: isLoading,
    error: error ? '데이터 로딩 중 오류가 발생했습니다.' : null,
    handleScroll,
    isScrolled,
    setIsScrolled,
    bookMarkCheck,
  };
};
