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

const SORT_MAP: Record<string, string> = {
    '최신순': 'asc',
    '인기순': 'desc',
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
        let result: CocktailDetail[] = [];
        const hasFilter =
            (keyword && keyword.trim() !== '') ||
            abvBand ||
            style ||
            (flavor && flavor.length > 0) ||
            (base && base.length > 0);
        if (hasFilter) {

            const mappedAbv = abvBand ? ABV_MAP[abvBand] : undefined;
            const mappedSort = sort ? SORT_MAP[sort] : undefined;
            const mappedFlavor = flavor?.map(f => TASTE_MAP[f]).filter(Boolean);
            const styleParam = style;
            const baseParam = base;

            result = await this.dataSource.search(
                keyword?.trim(),
                mappedAbv,
                styleParam,
                mappedFlavor,
                baseParam,
                mappedSort,
                page,
                size,
            );
        } else {
            result = await this.dataSource.search();
        }

        const validSchema = result.map((item) => {
            return CocktailSchema.parse(item);
        });

        return validSchema.map(dto => ({
            id: dto.id,
            name: dto.korName,
            type: dto.style,
            image: dto.imageUrl,
            isBookmarked: dto.isBookmarked
        }));
    }

}
