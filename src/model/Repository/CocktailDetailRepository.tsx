import { CocktailDetail } from '../domain/CocktailDetail';
import { CocktailDetailDataSource } from '../DataSource/CocktailDetailDataSource';
import { CocktailSchema } from '../Schema/CocktailSchema';

export interface ICocktailDetailRepository {
  getDetailData(id: number): Promise<CocktailDetail>;
}

export class CocktailDetailRepository implements ICocktailDetailRepository {
  private dataSource: CocktailDetailDataSource;

  constructor(dataSource?: CocktailDetailDataSource) {
    this.dataSource = dataSource ?? new CocktailDetailDataSource();
  }

  async getDetailData(id: number): Promise<CocktailDetail> {

    const dtoRaw = await this.dataSource.fetchCocktailDetail(id);


    const dto = CocktailSchema.parse(dtoRaw);


    const detail: CocktailDetail = {
      id: dto.id,
      korName: dto.korName,
      engName: dto.engName,
      abvBand: dto.abvBand,
      maxAlcohol: dto.maxAlcohol,
      minAlcohol: dto.minAlcohol,
      originText: dto.originText,
      season: dto.season,
      ingredients: dto.ingredients,
      style: dto.style,
      glassType: dto.glassType,
      glassImageUrl: dto.glassImageUrl,
      base: dto.base,
      imageUrl: dto.imageUrl,
      flavors: dto.flavors,
      moods: dto.moods,
      isBookmarked: dto.isBookmarked
    };

    return detail;
  }
}

