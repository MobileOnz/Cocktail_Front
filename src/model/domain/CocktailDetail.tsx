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
    glassImageUrl: string;
    base: string;
    imageUrl: string;
    flavors: string[];
    moods: string[];
}
