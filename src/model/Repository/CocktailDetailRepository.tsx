import { CocktailDetail } from '../domain/CocktailDetail';
import { CocktailDetailDataSource } from '../DataSource/CocktailDetailDataSource';
import { CocktailSchema } from '../Schema/CocktailSchema';
import { CocktailCard } from '../domain/CocktailCard';

export interface ICocktailDetailRepository {
  getDetailData(id: number): Promise<CocktailDetail>;
  recommendCocktails(style: string): Promise<CocktailCard[]>;
  fetchCocktailRecommendations(cocktailId: string): Promise<string>;
  postCocktailRecommendation(cocktailId: string, reactionType: string): Promise<void>;
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
      isBookmarked: dto.isBookmarked,
    };

    return detail;
  }

  async recommendCocktails(style: string): Promise<CocktailCard[]> {
    const dto = await this.dataSource.recommendCocktails(style);

    const validSchema = dto.map((item) => {
      return CocktailSchema.parse(item);
    });

    return validSchema.map(dto => ({
      id: dto.id,
      name: dto.korName,
      type: dto.style,
      image: dto.imageUrl,
      isBookmarked: dto.isBookmarked,
    }));
  }

  async fetchCocktailRecommendations(cocktailId: string) {
    return this.dataSource.fetchCocktailReaction(cocktailId);
  }

  async postCocktailRecommendation(cocktailId: string, reactionType: string) {
    return this.dataSource.postCocktailReaction(cocktailId, reactionType);
  }

}

