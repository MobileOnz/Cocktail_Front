export interface CocktailQuest {
    flavor: 'SWEET' | 'SPARKLING' | 'CITRUS' | 'TROPICAL' | 'BITTER' | 'SPICY' | 'HERBAL';
    mood: 'MEAL_TIME' | 'ROMANTIC' | 'PARTY' | 'CASUAL' | 'MODERN' | 'CLASSIC';
    season: 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER' | 'ALL';
    style: 'LIGHT' | 'STANDARD' | 'SPECIAL' | 'STRONG' | 'CLASSIC';
    abvBand: 'LOW' | 'MEDIUM' | 'HIGH'
}
