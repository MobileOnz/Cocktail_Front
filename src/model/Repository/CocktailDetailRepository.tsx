import { CocktailDetailDto } from '../DTO/CocktailDetailDto';

export interface CocktailRepository {
  getDetail(id: number): Promise<CocktailDetailDto>;
}
