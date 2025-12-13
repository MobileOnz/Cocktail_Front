import instance from "../../tokenRequest/axios_interceptor";
import { CocktailDto } from "../dto/CocktailDto";

export class HomeCocktailListDataSource {
    async refreshingCocktailData(): Promise<CocktailDto[]> {
        const res = await instance.get("/api/v2/cocktails/refresh")

        return res.data.data as CocktailDto[];
    }

    async intermediateCocktailData(): Promise<CocktailDto[]> {
        const res = await instance.get("/api/v2/cocktails/intermediate")

        return res.data.data as CocktailDto[];
    }

    async beginnerCocktailData(): Promise<CocktailDto[]> {
        const res = await instance.get("/api/v2/cocktails/beginner")

        return res.data.data as CocktailDto[];
    }

}
