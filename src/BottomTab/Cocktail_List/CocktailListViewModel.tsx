import { useCallback, useEffect, useState } from 'react';
import { IHomeCocktailRepository } from '../../model/Repository/HomeCocktailRepository';
import { di } from '../../DI/Container';
import { CocktailCard } from '../../model/domain/CocktailCard';
import { CocktailMain } from '../../model/domain/CocktailMain';
import instance from '../../tokenRequest/axios_interceptor';
import { useNavigation } from '@react-navigation/native';
import { getToken } from '../../tokenRequest/Token';
import Toast from 'react-native-toast-message';


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
  const navigation = useNavigation();

  const goToCocktailBox = async () => {
    const token = await getToken();
    if (token) {
      navigation.navigate('CocktailBoxScreen' as never);
    } else {
      Toast.show({
        type: 'info',
        text1: '로그인이 필요한 서비스입니다.',
      }
      )
    }
  }

  const bookmarked = async (cocktailId: number) => {

    //바로 아이템 표시를 위해 낙관적 UI 구조 활용
    const toggleBookmarkInList = (list: CocktailCard[]) =>
      list.map(item =>
        item.id === cocktailId
          ? { ...item, isBookmarked: !item.isBookmarked }
          : item
      );

    setBestCocktail(prev => toggleBookmarkInList(prev));
    setNewCocktail(prev => toggleBookmarkInList(prev));
    setRefreshList(prev => toggleBookmarkInList(prev));
    setBeginnerList(prev => toggleBookmarkInList(prev));
    setIntermediateList(prev => toggleBookmarkInList(prev));



    try {
      await instance.post(`/api/v2/cocktails/${cocktailId}/bookmarks`);

    } catch (error: any) {
      console.error('북마크 처리 중 에러 발생:', error);
      console.log('에러 데이터:', error.response.data);
      console.log('에러 상태코드:', error.response.status);
      console.log('에러 헤더:', error.response.headers);
      await fetchHomeData();
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
      const [randomCocktailData, newCocktailData, bestCocktailData, refreshData, intermediateData, beginnerData] = await Promise.all([
        repository.random(),
        repository.newCocktail(),
        repository.bestCocktail(),
        repository.refresh(),
        repository.intermediate(),
        repository.beginner(),
      ]);
      if (refreshData && refreshData.length > 0) {
        console.log('--- [Refresh 리스트 전체 북마크 체크] ---');

        refreshData.forEach((item: any, index: number) => {
          console.log(`[${index}] 아이템명: ${item.name || '이름없음'}`);
          console.log(`    - ID: ${item.id}`);
          console.log(`    - isBookmarked 값: ${item.isBookmarked}`);

          // 만약 isBookmarked가 undefined라면, 다른 비슷한 필드가 있는지 전체 출력
          if (item.isBookmarked === undefined) {
            console.log('    - [경고] isBookmarked가 없습니다! 실제 데이터 구조:', JSON.stringify(item));
          }
        });

        console.log('---------------------------------------');
      } else {
        console.log('--- [Refresh 리스트] 데이터가 비어있습니다. ---');
      }
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

  // 2. 마운트 시점에 한 번만 실행
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
    goToCocktailBox,
  };
};
