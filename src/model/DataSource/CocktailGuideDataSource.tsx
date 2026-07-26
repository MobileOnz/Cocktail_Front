import { GuideResponseDto } from '../dto/GuideDto';
import { API_BASE_URL } from '@env';
import instance from '../../tokenRequest/axios_interceptor';
import { GuideListResponseDto } from '../dto/GuideListDto';

export class CocktailGuideDataSource  {
    async guideDetail(part: number): Promise<GuideResponseDto> {
        try {
            const res = await instance.get(`${API_BASE_URL}/api/v2/cocktails/guide`, {
                params: {
                    part : part,
                },
            });

            console.log('CocktailGuideDataSource_guideDetail 응답: ', JSON.stringify(res.data));

            return res.data;
        } catch(e) {
            console.error('guideDetail 실패:', e);
            throw e;
        }
    }

    async guideList(): Promise<GuideListResponseDto> {
        try {
            // 가이드 목록은 매거진 GUIDE 카테고리에서 온다(V12 흡수).
            const res = await instance.get(`${API_BASE_URL}/api/v2/magazine`, {
                params: { category: 'GUIDE' },
            });
            return res.data;
        } catch(e) {
            console.error('guideList 실패:', e);
            throw e;
        }

    }


}
