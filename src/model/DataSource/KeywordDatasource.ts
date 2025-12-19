import instance from '../../tokenRequest/axios_interceptor';
import { Keyword } from '../dto/KeywordDto';

export class KeywordDatasource {
    async fetchKeyword(): Promise<Keyword[]> {
        const res = await instance.get('/api/v2/cocktails/names');
        return res.data.data as Keyword[];
    }
}
