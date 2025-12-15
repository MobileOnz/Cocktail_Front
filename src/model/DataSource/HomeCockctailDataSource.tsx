import instance from '../../tokenRequest/axios_interceptor';
import { CocktailDto } from '../dto/CocktailDto';

export class HomeCocktailListDataSource {
    // // 랜덤
    // async randomCocktailData(): Promise<CocktailDto[]> {
    //     const res = await instance.get("/api/v2/cocktails/refresh")

    //     return res.data.data as CocktailDto[];
    // }

    // 베스트
    async bestCocktailData(): Promise<CocktailDto[]> {
        const res = await instance.get('/api/v2/cocktails', {
            params: {
                'page': 0,
                'size': 10,
                'sort': 'korName,asc',
            },
        });

        return res.data.data.content as CocktailDto[];
    }
    // 새로 업데이트 된
    async newCOcktailData(): Promise<CocktailDto[]> {
        const res = await instance.get('/api/v2/cocktails', {
            params: {
                'page': 0,
                'size': 10,
                'sort': 'korName,asc',
            },
        });

        return res.data.data.content as CocktailDto[];
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
