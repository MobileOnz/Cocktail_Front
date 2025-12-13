import { SearchDataSource } from "../DataSource/SearchDataSource";
import { CocktailCard } from "../domain/CocktailCard";
import { CocktailSchema } from "../Schema/CocktailSchema";

export interface ICocktailSearchRepository {
    search(keyword: string): Promise<CocktailCard[]>
}

export class CocktailSearchRepository implements ICocktailSearchRepository {
    private dataSource: SearchDataSource;

    constructor(dataSource?: SearchDataSource) {
        this.dataSource = dataSource ?? new SearchDataSource();
    }
    async search(keyword: string): Promise<CocktailCard[]> {
        const dto = await this.dataSource.search(keyword);

        const validSchema = dto.map((item) => {
            return CocktailSchema.parse(item);
        });

        return validSchema.map(dto => ({
            id: dto.id,
            name: dto.korName,
            type: dto.style,
            image: dto.imageUrl,
        }));
    }

}