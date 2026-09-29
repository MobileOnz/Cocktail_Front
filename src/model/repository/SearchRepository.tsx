import { SearchDataSource } from '../DataSource/SearchDataSource';
import { CocktailCard } from '../domain/CocktailCard';
import { CocktailDetail } from '../domain/CocktailDetail';
import { CocktailSchema } from '../Schema/CocktailSchema';

const ABV_MAP: Record<string, string> = {
    '약함': 'WEAK',
    '보통': 'NORMAL',
    '강함': 'STRONG',
};

const TASTE_MAP: Record<string, string> = {
    '과일(Fruity)': 'FRUIT',
    '쌉쌀함(Bitter)': 'BITTER',
    '달콤함(Sweet)': 'SWEET',
    '부드러움(Creamy/Soft)': 'CREAMY',
    '복합적인 맛(Complex)': 'COMPLEX',
    '허브 & 스파이스(Herb & Spice)': 'HERBAL_SPICE',
    '라이트 & 청량함(Light & Refreshing)': 'LIGHT_REFRESHING',
    '개성 강한 맛(Unique & Strong)': 'STRONG_UNIQUE',
    '기타 & 특별한 맛(Etc. & Unique Flavors)': 'ETC_SPECIAL',
};

/**
 * 서버 Pageable 은 "속성,방향" 형식만 알아듣는다 (지원 속성: id / korName / engName / recommendCount).
 *
 * 예전엔 방향만('asc' / 'desc') 보냈다. 서버는 'asc' 를 속성명으로 읽고 찾지 못해 id ASC 로 폴백했고,
 * 그래서 최신순이든 인기순이든 목록이 똑같이 나왔다 (QA: "어떤 걸 골라도 전 항목이 다 나온다").
 */
const SORT_MAP: Record<string, string> = {
    '최신순': 'id,desc',
    '인기순': 'recommendCount,desc',
};

export interface ISearchRepository {
    search(keyword?: string, abvBand?: string, style?: string, flavor?: string[], base?: string[], sort?: string, page?: number, size?: number): Promise<CocktailCard[]>
}

export class SearchRepository implements ISearchRepository {
    private dataSource: SearchDataSource;

    constructor(dataSource?: SearchDataSource) {
        this.dataSource = dataSource ?? new SearchDataSource();
    }
    async search(keyword?: string, abvBand?: string, style?: string, flavor?: string[], base?: string[], sort?: string, page = 0, size = 10): Promise<CocktailCard[]> {
        // 조건이 하나도 없을 때 인자를 전부 버리는 분기가 있었는데, 그 분기가 정렬까지 같이 버렸다.
        // → 다른 조건 없이 정렬만 바꾸면 아무 일도 일어나지 않았다. 항상 그대로 넘긴다
        //   (비어 있는 값은 DataSource 가 undefined 로 떨어뜨린다).
        const result: CocktailDetail[] = await this.dataSource.search(
            keyword?.trim(),
            abvBand ? ABV_MAP[abvBand] : undefined,
            style,
            flavor?.map(f => TASTE_MAP[f]).filter(Boolean),
            base,
            sort ? SORT_MAP[sort] : undefined,
            page,
            size,
        );

        const validSchema = result.map((item) => {
            return CocktailSchema.parse(item);
        });

        // Search result grid → prefer thumb, fall back to original.
        return validSchema.map(dto => ({
            id: dto.id,
            name: dto.korName,
            type: dto.style,
            image: dto.imageUrlThumb ?? dto.imageUrl,
            isBookmarked: dto.isBookmarked,
        }));
    }

}
