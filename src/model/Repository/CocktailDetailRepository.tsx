import { CocktailDto } from "../dto/CocktailDto";

export interface CocktailRepository {
  getDetail(id: number): Promise<CocktailDto>;
}
