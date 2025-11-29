import { useEffect, useState } from 'react';
import { cocktailDetailTestData } from './TestData';
import { BestCocktailDto } from '../../model/DTO/bestCocktailDto';
import { NewCocktailDto } from '../../model/DTO/NewCocktailDto';



//베스트 칵테일 가져오기
export const useBestCocktail = () => {
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

