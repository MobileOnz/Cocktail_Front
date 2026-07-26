import { CocktailGuideDataSource } from '../DataSource/CocktailGuideDataSource';
import { Guide } from '../domain/GuideDetail';
import { GuideSummary } from '../domain/GuideSummary';

export class CocktailGuideRepository {
  constructor(
    private cocktailGuideDataSource: CocktailGuideDataSource,
  ) {}

  async guideList(): Promise<GuideSummary[]> {
    const res = await this.cocktailGuideDataSource.guideList();

    // 매거진 GUIDE 카테고리에서 온다. part 는 V12 에서 magazine.id 로 보존됨.
    return (res.data.items ?? []).map(item => ({
        part: item.id,
        title: item.title,
        imageUrl: item.imageUrl ?? '',
        category: item.categoryLabel ?? null,
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
