import { HomeCocktailListDataSource } from '../DataSource/HomeCockctailDataSource';
import { CocktailCard } from '../domain/CocktailCard';
import { CocktailMain } from '../domain/CocktailMain';
import { CocktailSchema } from '../Schema/CocktailSchema';

export interface IHomeCocktailRepository {
    random(): Promise<CocktailMain>
    refresh(): Promise<CocktailCard[]>
    intermediate(): Promise<CocktailCard[]>
    beginner(): Promise<CocktailCard[]>
    newCocktail(): Promise<CocktailCard[]>
    bestCocktail(): Promise<CocktailCard[]>
}

export class HomeCocktailRepository implements IHomeCocktailRepository {
    private dataSource: HomeCocktailListDataSource;

    constructor(dataSource?: HomeCocktailListDataSource) {
        this.dataSource = dataSource ?? new HomeCocktailListDataSource();
    }
    // 랜덤
    async random(): Promise<CocktailMain> {
        const dto = await this.dataSource.randomCocktailData();

        const validSchema = CocktailSchema.parse(dto);


        return {
            id: validSchema.id,
            korName: validSchema.korName,
            engName: validSchema.engName,
            image: validSchema.imageUrl,
        };
    }

    // 새로운
    async newCocktail(): Promise<CocktailCard[]> {
        const dto = await this.dataSource.newCOcktailData();

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
    // 베스트
    async bestCocktail(): Promise<CocktailCard[]> {
        const dto = await this.dataSource.bestCocktailData();

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
