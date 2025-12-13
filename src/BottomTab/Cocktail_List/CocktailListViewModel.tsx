import { useCallback, useEffect, useState } from 'react';
import { cocktailDetailTestData } from './TestData';
import { BestCocktailDto } from '../../model/DTO/bestCocktailDto';
import { NewCocktailDto } from '../../model/DTO/NewCocktailDto';
import { IHomeCocktailRepository } from '../../model/repository/HomeCocktailRepository';
import { di } from '../../DI/Container';
import { CocktailCard } from '../../model/domain/CocktailCard';

type UseSearchResultDeps = {
  repository?: IHomeCocktailRepository;
};

export const useHomeViewModel = (deps?: { repository?: IHomeCocktailRepository }) => {
  const repository = deps?.repository ?? di.homeCocktailRepository;
  const [refreshList, setRefreshList] = useState<CocktailCard[]>([]);
  const [intermediateList, setIntermediateList] = useState<CocktailCard[]>([]);
  const [beginnerList, setBeginnerList] = useState<CocktailCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHomeData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [refreshData, intermediateData, beginnerData] = await Promise.all([
        repository.refresh(),
        repository.intermediate(),
        repository.beginner(),
      ]);

      setRefreshList(refreshData);
      setIntermediateList(intermediateData);
      setBeginnerList(beginnerData);

    } catch (e) {
      console.log(e);
      setError("데이터 로딩 중 오류가 발생했습니다.");
    } finally {
      setLoading(false)
    }


  }, [repository])

  useEffect(() => {
    fetchHomeData()

  }, [fetchHomeData])

  return {
    refreshList,
    beginnerList,
    intermediateList,
    loading,
    error
  }
}

//베스트 칵테일 가져오기
export const useBestCocktail = (deps?: IHomeCocktailRepository) => {
  const [cocktails, setCocktails] = useState<BestCocktailDto[]>([]);

  useEffect(() => {
    const bestCocktailData = cocktailDetailTestData.map((item, index) => ({
      id: item.id,
      title: item.title,
      image: item.image,
      rank: `${index + 1}`,
    }));
    setCocktails(bestCocktailData);
  }, []);
  return { cocktails };
};

//새로운 칵테일 가져오기
export const useNewCocktail = () => {
  const [newCocktails, setCocktails] = useState<NewCocktailDto[]>([]);

  useEffect(() => {
    const newCocktailData = cocktailDetailTestData.map((item) => ({
      id: item.id,
      name: item.title,
      type: item.tone,
      image: item.image,
    }));
    setCocktails(newCocktailData);
  }, []);
  return { newCocktails };
};

//칵테일 필더적용
export const useCocktailLIst = () => {
  const [allCocktails, setCocktails] = useState<NewCocktailDto[]>([]);

  useEffect(() => {
    const newCocktailData = cocktailDetailTestData.map((item) => ({
      id: item.id,
      name: item.title,
      type: item.tone,
      image: item.image,
    }));
    setCocktails(newCocktailData);
  }, []);
  return { allCocktails };
};

export default function useCocktailListViewModel() {

}