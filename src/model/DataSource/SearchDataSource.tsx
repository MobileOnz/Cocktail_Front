import instance from "../../tokenRequest/axios_interceptor";
import { CocktailDto } from "../dto/CocktailDto";

export class SearchDataSource {
    async search(keyword: string): Promise<CocktailDto[]> {
        const res = await instance.get('/api/v2/cocktails', {
            params: {
                korName: keyword,
                sort: 'name,asc',      // "필드명,정렬방향"
            },
        });

        return res.data.data.content as CocktailDto[];
    }
}