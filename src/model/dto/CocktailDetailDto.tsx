export interface CocktailDetailDto {
    id: number;


    title: string;
    image: string;


    tone: 'light' | 'standard' | 'special' | 'strong' | 'classic';
    season: string;

    summary: string;
    story: string;

    abv: string;
    base: string;
    category: string;
    taste: string;
    body: string;
    mood: string;
    ingredients: { name: string; amount: string }[];
    garnish: string[];
}
