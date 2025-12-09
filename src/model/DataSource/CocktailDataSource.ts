import { cocktailDetailTestData } from '../../BottomTab/Cocktail_List/TestData';
import { CocktailDto } from '../dto/CocktailDto';
import { CocktailRepository } from '../Repository/CocktailDetailRepository';

export class CocktailDataSource implements CocktailRepository {
  async getDetail(id: number): Promise<CocktailDto> {
    const detail = cocktailDetailTestData.find(c => c.id === id);
    if (!detail) { throw new Error('Not Found'); }
    return detail;
  }
}
