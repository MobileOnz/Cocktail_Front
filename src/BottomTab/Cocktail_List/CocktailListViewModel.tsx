import { useCallback, useEffect, useState } from 'react';
import { IHomeCocktailRepository } from '../../model/repository/HomeCocktailRepository';
import { di } from '../../DI/Container';
import { CocktailCard } from '../../model/domain/CocktailCard';
import { CocktailMain } from '../../model/domain/CocktailMain';


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
    randomCocktail,
    bestCocktail,
    newCocktail,
    refreshList,
    beginnerList,
    intermediateList,
    loading,
    error,
  };
};
