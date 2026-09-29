import instance from '../../tokenRequest/axios_interceptor';
import { CocktailDto } from '../dto/CocktailDto';
// import AsyncStorage from '@react-native-async-storage/async-storage';

export type ArchiveTab = 'BOOKMARK' | 'MADE' | 'RECOMMEND' | 'HARD';

export class BookMarksDataSource {
    async fetchBookMarks(): Promise<CocktailDto[]> {
        const result = await instance.get('/api/v2/cocktails/bookmarks', { authPrompt: true });

        return result.data?.data?.cocktails as CocktailDto[];
    }

    /**
     * 보관함 탭별 목록.
     * 저장만 응답 형태가 다르다(`data.cocktails`), 나머지는 `data` 가 배열이다.
     */
    async fetchArchive(tab: ArchiveTab): Promise<CocktailDto[]> {
        if (tab === 'BOOKMARK') {
            return this.fetchBookMarks();
        }
        const url = tab === 'MADE'
            ? '/api/v2/cocktails/made'
            : `/api/v2/cocktails/reactions/me?type=${tab}`;
        const result = await instance.get(url, { authPrompt: true });
        return (result.data?.data ?? []) as CocktailDto[];
    }
}
