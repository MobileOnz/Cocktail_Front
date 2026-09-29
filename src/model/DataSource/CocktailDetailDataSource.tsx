import instance from '../../tokenRequest/axios_interceptor';
import { CocktailCard } from '../domain/CocktailCard';
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

    async recommendCocktails(style: string): Promise<CocktailCard[]> {
        try {
            const res = await instance.post('/api/v2/cocktails',

                {
                    style: style,
                },

                {
                    params: {
                        page: 0,
                        size: 3,
                        sort: 'korName,asc',
                    },
                }
            );

            return res.data.data.content as CocktailCard[];
        } catch (error) {
            console.error('[RecommendRepo] 칵테일 추천 API 에러:', error);
            return [];
        }
    }
    async fetchCocktailReaction(cocktailId: string) {
        try {

            const res = await instance.get(`/api/v2/cocktails/${cocktailId}/reactions`);
            return res.data?.myReaction ?? null;
        } catch (error) {
            console.error('칵테일 추천 API 에러:', error);
            throw error;
        }

    }

    async postCocktailReaction(cocktailId: string, reactionType: string) {
        try {
            return await instance.post(`/api/v2/cocktails/${cocktailId}/reactions`,
                {
                    reactionType: reactionType,
                },

            );
        } catch (error) {
            console.error('칵테일 추천 API 에러:', error);
            throw error;
        }
    }
}
