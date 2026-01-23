import instance from '../../tokenRequest/axios_interceptor';
import { CocktailMain } from '../domain/CocktailMain';
import { CocktailDto } from '../dto/CocktailDto';

export class HomeCocktailListDataSource {
    // 랜덤
    async randomCocktailData(): Promise<CocktailMain> {
        const res = await instance.get('/api/v2/cocktails/random');

        return res.data.data as CocktailMain;
    }

    // 베스트
    async bestCocktailData(): Promise<CocktailDto[]> {
        try {
            const res = await instance.get('/api/v2/cocktails/best');
            return res.data?.data ?? [];
        } catch (error) {
            console.error('Best Cocktail API Error:', error);
            return [];
        }
    }
    // 새로 업데이트 된
    async newCOcktailData(): Promise<CocktailDto[]> {
        const res = await instance.get('/api/v2/cocktails/recent');

        return res.data.data as CocktailDto[];
    }


    // 상큼한
    async refreshingCocktailData(): Promise<CocktailDto[]> {
        const res = await instance.get('/api/v2/cocktails/refresh');

        return res.data.data as CocktailDto[];
    }
    // 중급
    async intermediateCocktailData(): Promise<CocktailDto[]> {
        const res = await instance.get('/api/v2/cocktails/intermediate');

        return res.data.data as CocktailDto[];
    }
    // 초급
    async beginnerCocktailData(): Promise<CocktailDto[]> {
        const res = await instance.get('/api/v2/cocktails/beginner');

        return res.data.data as CocktailDto[];
    }


}
