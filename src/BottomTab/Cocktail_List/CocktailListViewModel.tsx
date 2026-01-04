import { useCallback, useEffect, useState } from 'react';
import { IHomeCocktailRepository } from '../../model/repository/HomeCocktailRepository';
import { di } from '../../DI/Container';
import { CocktailCard } from '../../model/domain/CocktailCard';
import { CocktailMain } from '../../model/domain/CocktailMain';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import instance from '../../tokenRequest/axios_interceptor';


type UseSearchResultDeps = {
  repository?: IHomeCocktailRepository;
};

export const useHomeViewModel = (deps?: UseSearchResultDeps) => {
  const repository = deps?.repository ?? di.homeCocktailRepository;
  const [randomCocktail, setRandomCocktail] = useState<CocktailMain>();
  const [newCocktail, setNewCocktail] = useState<CocktailCard[]>([]);
  const [bestCocktail, setBestCocktail] = useState<CocktailCard[]>([]);
  const [refreshList, setRefreshList] = useState<CocktailCard[]>([]);
  const [intermediateList, setIntermediateList] = useState<CocktailCard[]>([]);
  const [beginnerList, setBeginnerList] = useState<CocktailCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const bookmarked = async (cocktailId: number) => {
    console.log('북마크 토큰:', cocktailId);
    try {
      const token = await AsyncStorage.getItem('accessToken');

      if (!token) {
        console.log('토큰이 없습니다. 로그인이 필요합니다.');
        return;
      }


      const result = await instance.post(
        `/api/v2/cocktails/${cocktailId}/bookmarks`,
        {},
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      console.log('북마크 결과:', result.data);

    } catch (error: any) {
      console.error('북마크 처리 중 에러 발생:', error);
      console.log('에러 데이터:', error.response.data);
      console.log('에러 상태코드:', error.response.status);
      console.log('에러 헤더:', error.response.headers);
    }
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    const isTop = offsetY <= 10;

    if (!isTop && !isScrolled) {
      setIsScrolled(true);
    } else if (isTop && isScrolled) {
      setIsScrolled(false);
    }
  };

  const fetchHomeData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(API_BASE_URL);
      const [randomCocktailData, newCocktailData, bestCocktailData, refreshData, intermediateData, beginnerData] = await Promise.all([
        repository.random(),
        repository.newCocktail(),
        repository.bestCocktail(),
        repository.refresh(),
        repository.intermediate(),
        repository.beginner(),
      ]);
      setRandomCocktail(randomCocktailData);
      setNewCocktail(newCocktailData);
      setBestCocktail(bestCocktailData);
      setRefreshList(refreshData);
      setIntermediateList(intermediateData);
      setBeginnerList(beginnerData);

    } catch (e) {
      console.log(e);
      setError('데이터 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }


  }, [repository]);

  useEffect(() => {
    fetchHomeData();

  }, [fetchHomeData]);

  return {
    bookmarked,
    randomCocktail,
    bestCocktail,
    newCocktail,
    refreshList,
    beginnerList,
    intermediateList,
    loading,
    error,
    handleScroll,
    isScrolled,
    setIsScrolled,
  };
};
