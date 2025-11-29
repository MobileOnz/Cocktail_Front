import { cocktailDetailTestData } from '../../BottomTab/Cocktail_List/TestData';
import { CocktailDetailDto } from '../DTO/CocktailDetailDto';
import { CocktailRepository } from '../Repository/CocktailDetailRepository';

export class CocktailDataSource implements CocktailRepository {
  async getDetail(id: number): Promise<CocktailDetailDto> {
    const detail = cocktailDetailTestData.find(c => c.id === id);
    if (!detail) { throw new Error('Not Found'); }
    return detail;
  }
}
