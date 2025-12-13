import { HomeCocktailListDataSource } from "../DataSource/HomeCockctailDataSource";
import { CocktailCard } from "../domain/CocktailCard";
import { CocktailSchema } from "../Schema/CocktailSchema";

export interface IHomeCocktailRepository {
    refresh(): Promise<CocktailCard[]>
    intermediate(): Promise<CocktailCard[]>
    beginner(): Promise<CocktailCard[]>
}

export class HomeCocktailRepository implements IHomeCocktailRepository {
    private dataSource: HomeCocktailListDataSource;

    constructor(dataSource?: HomeCocktailListDataSource) {
        this.dataSource = dataSource ?? new HomeCocktailListDataSource();
    }

    // 상큼한
    async refresh(): Promise<CocktailCard[]> {
        const dto = await this.dataSource.refreshingCocktailData();

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

    // 중급자
    async intermediate(): Promise<CocktailCard[]> {
        const dto = await this.dataSource.intermediateCocktailData();

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

    // 입문자
    async beginner(): Promise<CocktailCard[]> {
        const dto = await this.dataSource.beginnerCocktailData();

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