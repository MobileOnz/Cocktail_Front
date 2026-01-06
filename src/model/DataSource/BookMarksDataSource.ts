import instance from '../../tokenRequest/axios_interceptor';
import { CocktailDto } from '../dto/CocktailDto';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class BookMarksDataSource {
    async fetchBookMarks(): Promise<CocktailDto[]> {
        const token = await AsyncStorage.getItem('accessToken');
        const result = await instance.get('/api/v2/cocktails/bookmarks');

        return result.data?.data?.cocktails as CocktailDto[];
    }
}
