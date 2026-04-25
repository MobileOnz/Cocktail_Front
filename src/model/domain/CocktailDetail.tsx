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
    isBookmarked: boolean;
    // Image variants (nullable until S3 image pipeline is run)
    imageUrlThumb?: string | null;
    imageUrlDetail?: string | null;
    glassImageUrlThumb?: string | null;
    glassImageUrlDetail?: string | null;
}
