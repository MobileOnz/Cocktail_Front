export interface CocktailDetail {
    id: number;
    korName: string;
    engName: string;
    abvBand: string;
    maxAlcohol: number;
    minAlcohol: number;
    originText: string;
    season: string;
    ingredients: string[];
    style: string;
    glassType: string;
    glassImageUrl: string | null;
    base: string;
    /** 사진이 없는 칵테일이 있다(대체본 미확보). 화면은 빈 자리를 그린다. */
    imageUrl: string | null;
    flavors: string[];
    moods: string[];
    isBookmarked: boolean;
    // Image variants (nullable until S3 image pipeline is run)
    imageUrlThumb?: string | null;
    imageUrlDetail?: string | null;
    glassImageUrlThumb?: string | null;
    glassImageUrlDetail?: string | null;
}
