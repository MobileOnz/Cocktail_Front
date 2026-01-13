import instance from '../../tokenRequest/axios_interceptor';
import { CocktailDto } from '../dto/CocktailDto';

export class CocktailDetailDataSource {
    async fetchCocktailDetail(id: number): Promise<CocktailDto[]> {
        const res = await instance.get('/api/v2/cocktails/detail', {
            params: {
                cocktailId: id,
            },
        });
        return res.data.data as CocktailDto[];
    }
    async responseButton(id: number): Promise<string> {
        const res = await instance.get(`api/v2/cocktails/${id}/reactions`);
        return res.data.myReaction ?? 'NONE';
    }

    async postButton(id: number, body: { reactionType: 'RECOMMEND' | 'HARD' | 'NONE' }) {
        await instance.post(`/api/v2/cocktails/${id}/reactions`, body);
    }
}
