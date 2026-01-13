import { API_BASE_URL } from '@env';
import instance from '../../tokenRequest/axios_interceptor';
import { CocktailQuest } from '../domain/CocktailRec';
import { CocktailDetail } from '../domain/CocktailDetail';

export class RecommendCocktailDataSource {
    async recommend(data: CocktailQuest): Promise<CocktailDetail> {
        console.log('요청 Data: ', data);
        const res = await instance.get(`${API_BASE_URL}/api/v2/cocktails/recommendation`,
            { params: data }
        );

        const dto = res.data.data;
        console.log('RecommendCocktailDataSource 응답: ', JSON.stringify(res.data));
        return {
            id: dto.id,
            korName: dto.korName,
            engName: dto.engName,
            abvBand: dto.abvBand,
            maxAlcohol: dto.maxAlcohol,
            minAlcohol: dto.minAlcohol,
            originText: dto.originText,
            season: dto.season,
            ingredients: dto.ingredients,
            style: dto.style,
            glassType: dto.glassType,
            glassImageUrl: dto.glassImageUrl,
            base: dto.base,
            imageUrl: dto.imageUrl,
            flavors: dto.flavors,
            moods: dto.moods,
        };

    }
}
