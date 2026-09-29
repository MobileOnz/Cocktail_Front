import instance from '../../tokenRequest/axios_interceptor';
import { CocktailDto } from '../dto/CocktailDto';

export class SearchDataSource {
    async search(keyword?: string, abvBand?: string, style?: string, flavor?: string[], base?: string[], sort?: string, page = 0, size = 10): Promise<CocktailDto[]> {
        // 예전엔 조건이 없으면 sort 를 안 넘겨 여기서 가나다순으로 채웠다. 이제 호출부가
        // 항상 정렬을 넘기므로 이 폴백은 사실상 도달하지 않는다. 그래도 남겨 두되 값은
        // 화면의 기본값(최신순)과 맞춘다 — 'korName,asc' 로 두면 다음 사람이 기본 정렬을 오독한다.
        if (!sort || sort.trim() === '') {
            sort = 'id,desc';
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
                    page: page,
                    size: size,
                    sort: sort,
                },
            }

        );

        return res.data.data.content as CocktailDto[];
    }
}
