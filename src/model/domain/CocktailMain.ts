export interface CocktailMain {
    id: number;
    korName: string;
    engName: string;
    /** 사진이 없는 칵테일이 있다. 화면은 빈 자리를 그린다. */
    image: string | null;
}
