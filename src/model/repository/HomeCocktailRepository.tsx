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
    // 랜덤 — 홈 상단 hero(큰 이미지). detail 사이즈가 적합, 없으면 원본.
    async random(): Promise<CocktailMain> {
        const dto = await this.dataSource.randomCocktailData();

        const validSchema = CocktailSchema.parse(dto);


        return {
            id: validSchema.id,
            korName: validSchema.korName,
            engName: validSchema.engName,
            image: validSchema.imageUrlDetail ?? validSchema.imageUrl,
        };
    }

    // 새로운 — 리스트(작은 카드). thumb 우선, 없으면 원본.
    async newCocktail(): Promise<CocktailCard[]> {
        const dto = await this.dataSource.newCOcktailData();

        const validSchema = dto.map((item) => {
            return CocktailSchema.parse(item);
        });

        return validSchema.map(dto => ({
            id: dto.id,
            name: dto.korName,
            type: dto.style,
            image: dto.imageUrlThumb ?? dto.imageUrl,
            isBookmarked: dto.isBookmarked,
        }));
    }
    // 베스트 — 리스트
    async bestCocktail(): Promise<CocktailCard[]> {
        const dto = await this.dataSource.bestCocktailData();

        const validSchema = dto.map((item) => {
            return CocktailSchema.parse(item);
        });

        return validSchema.map(dto => ({
            id: dto.id,
            name: dto.korName,
            type: dto.style,
            image: dto.imageUrlThumb ?? dto.imageUrl,
            isBookmarked: dto.isBookmarked,
        }));
    }

    // 상큼한 — 리스트
    async refresh(): Promise<CocktailCard[]> {
        const dto = await this.dataSource.refreshingCocktailData();

        const validSchema = dto.map((item) => {
            return CocktailSchema.parse(item);
        });

        return validSchema.map(dto => ({
            id: dto.id,
            name: dto.korName,
            type: dto.style,
            image: dto.imageUrlThumb ?? dto.imageUrl,
            isBookmarked: dto.isBookmarked,
        }));
    }

    // 중급자 — 리스트
    async intermediate(): Promise<CocktailCard[]> {
        const dto = await this.dataSource.intermediateCocktailData();

        const validSchema = dto.map((item) => {
            return CocktailSchema.parse(item);
        });

        return validSchema.map(dto => ({
            id: dto.id,
            name: dto.korName,
            type: dto.style,
            image: dto.imageUrlThumb ?? dto.imageUrl,
            isBookmarked: dto.isBookmarked,
        }));
    }

    // 입문자 — 리스트
    async beginner(): Promise<CocktailCard[]> {
        const dto = await this.dataSource.beginnerCocktailData();

        const validSchema = dto.map((item) => {
            return CocktailSchema.parse(item);
        });

        return validSchema.map(dto => ({
            id: dto.id,
            name: dto.korName,
            type: dto.style,
            image: dto.imageUrlThumb ?? dto.imageUrl,
            isBookmarked: dto.isBookmarked,
        }));
    }


}
