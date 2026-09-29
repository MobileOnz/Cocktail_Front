export interface CocktailCard {
    id: number;
    name: string;
    type: string;
    /** 사진이 없는 칵테일이 있다. RemoteImage 가 null 이면 '이미지 준비중' 자리를 그린다. */
    image: string | null;
    isBookmarked: boolean;
}
