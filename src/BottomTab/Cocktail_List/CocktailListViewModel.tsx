import { useEffect, useState } from 'react';
import { BestCocktailDto } from '../../model/dto/bestCocktailDto';

const BestData : BestCocktailDto[] = [
  {
    id : 1,
    image : 'https://picsum.photos/400/400',
    name : '칵테일명',
  },
  {
    id : 2,
    image : 'https://picsum.photos/400/400',
    name : '칵테일명',
  },
  {
    id : 3,
    image : 'https://picsum.photos/400/400',
    name : '칵테일명',
  },
];

const NewCocktailData = [
  {
    id : 1, name : '칵테일명',type : 'light', image : 'https://picsum.photos/400/400',
  },
    {
    id : 2, name : '칵테일명',type : 'standard', image : 'https://picsum.photos/400/400',
  },
    {
    id : 3, name : '칵테일명',type : 'special', image : 'https://picsum.photos/400/400',
    },
    {
    id : 4, name : '칵테일명',type : 'strong', image : 'https://picsum.photos/400/400',
    },
     {
    id : 5, name : '칵테일명',type : 'classic', image : 'https://picsum.photos/400/400',
    },
     {
    id : 6, name : '칵테일명',type : 'classic', image : 'https://picsum.photos/400/400',
    },
];

export interface BestCocktailVM {
  id: number;
  title: string;
  image: string;
  rank: string;
}
export interface NewCocktailVM{
  id: number;
  name: string;
  type: string;
  image: string;
}


//베스트 칵테일 가져오기
export const useBestCocktail = () => {
  const [cocktails, setCocktails] = useState<BestCocktailVM[]>([]);

  useEffect(() => {
    const bestCocktailData = BestData.map((item, index) => ({
      id : item.id,
      title : item.name,
      image : item.image,
      rank : `${index + 1}`,
    }));
    setCocktails(bestCocktailData);
  }, []);
  return {cocktails};
};

//새로운 칵테일 가져오기
export const useNewCocktail = () => {
  const [newCocktails, setCocktails] = useState<NewCocktailVM[]>([]);

  useEffect(() => {
    const newCocktailData = NewCocktailData.map((item) => ({
      id : item.id,
      name : item.name,
      type : item.type,
      image : item.image,
    }));
    setCocktails(newCocktailData);
  }, []);
  return {newCocktails};
};

//칵테일 가져오기 필터 적용 확인하기
export const useCocktailLIst = () => {
  const [allCocktails, setCocktails] = useState<NewCocktailVM[]>([]);

  useEffect(() => {
    const newCocktailData = NewCocktailData.map((item) => ({
      id : item.id,
      name : item.name,
      type : item.type,
      image : item.image,
    }));
    setCocktails(newCocktailData);
  }, []);
  return {allCocktails};
};

