import { CocktailGuideDataSource } from '../DataSource/CocktailGuideDataSource';
import { Guide } from '../domain/GuideDetail';
import { GuideSummary } from '../domain/GuideSummary';

export class CocktailGuideRepository {
  constructor(
    private cocktailGuideDataSource: CocktailGuideDataSource,
  ) {}

  async guideList(): Promise<GuideSummary[]> {
    const res = await this.cocktailGuideDataSource.guideList();

    return res.data.map(item => ({
        part: item.part,
        title: item.title,
        imageUrl: item.imageUrl,
    }));

  }

  async guideDetail(part: number): Promise<Guide> {
    const res = await this.cocktailGuideDataSource.guideDetail(part);

    return {
      part: res.data.part,
      title: res.data.title,
      imageUrl: res.data.imageUrl,
      details: res.data.details.map(d => ({
        order: d.displayOrder,
        subtitle: d.subtitle,
        description: d.description,
        imageUrl: d.imageUrl,
      })),
    };
  }

}
