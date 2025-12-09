import { SearchDataSource } from "../DataSource/SearchDataSource";
import { CocktailCard } from "../domain/CocktailCard";
import { CocktailSchema } from "../Schema/CocktailSchema";

export interface CocktailSearchResult {
    id: string,
    name: string,
    type: string,
    image: string,
}
export class CocktailSearchRepository {
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