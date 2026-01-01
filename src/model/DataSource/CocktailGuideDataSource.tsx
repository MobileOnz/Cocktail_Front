import { GuideResponseDto } from "../dto/GuideDto";
import { API_BASE_URL } from "@env";
import instance from "../../tokenRequest/axios_interceptor";
import { GuideListResponseDto } from "../dto/GuideListDto";

export class CocktailGuideDataSource  {
    async guideDetail(part: number): Promise<GuideResponseDto> {
        try {
            const res = await instance.get(`${API_BASE_URL}/api/v2/cocktails/guide`, {
                params: {
                    part : part
                },
            });

            console.log("CocktailGuideDataSource_guideDetail 응답: ", JSON.stringify(res.data))

            return res.data
        } catch(e) {
            console.error("guideDetail 실패:", e);
            throw e;
        }
    }

    async guideList(): Promise<GuideListResponseDto> {
        try {
            const res = await instance.get(`${API_BASE_URL}/api/v2/cocktails/guide/list`);
            console.log("CocktailGuideDataSource_guideList 응답: ", res.data)
            return res.data
        } catch(e) {
            console.error("guideList 실패:", e);
            throw e;
        }

    }

    
}