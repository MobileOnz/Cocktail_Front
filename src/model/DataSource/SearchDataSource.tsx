import instance from '../../tokenRequest/axios_interceptor';
import { CocktailDto } from '../dto/CocktailDto';

export class SearchDataSource {
    async search(keyword?: string, abvBand?: string, style?: string, flavor?: string[], base?: string[], sort?: string): Promise<CocktailDto[]> {
        if (!sort || sort.trim() === '') {
            sort = 'korName,asc';
        }
        const res = await instance.post('/api/v2/cocktails',
            {
                korName: keyword || undefined,
                abvBand: abvBand || undefined,
                style: style || undefined,
                flavor: (flavor && flavor.length > 0) ? flavor : undefined,
                base: (base && base.length > 0) ? base : undefined,
            },
            {
                params: {
                    page: 0,
                    size: 10,
                    sort: sort,
                },
            }

        );

        return res.data.data.content as CocktailDto[];
    }
}
