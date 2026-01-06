import { RecommendCocktailDataSource } from "../DataSource/RecommendCocktailDataSource";
import { CocktailDetail } from "../domain/CocktailDetail";
import { CocktailQuest } from "../domain/CocktailRec";

export class CocktailRecommendRepository  {
    constructor(
        private cocktailDataSource: RecommendCocktailDataSource,
    ) {}

    recommend(data: CocktailQuest): Promise<CocktailDetail> {
        return this.cocktailDataSource.recommend(data)
    }

}