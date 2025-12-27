import { useMemo, useState } from "react";
import { CocktailRecommendRepository } from "../../model/Repository/CocktailRecommendRepository";
import { RecommendCocktailDataSource } from "../../model/DataSource/RecommendCocktailDataSource";
import { CocktailDetail } from "../../model/domain/CocktailDetail";

const VideoViewModel = () => {
    const repository = useMemo(
        () =>
          new CocktailRecommendRepository(
            new RecommendCocktailDataSource(),
          ),
    []);

    const [textIdx, setTextIdx] = useState(0);
    
    const FLAVOR_OPTIONS = ['SWEET', 'SPARKLING', 'CITRUS', 'TROPICAL', 'BITTER', 'SPICY', 'HERBAL'] as const;
    const MOOD_OPTIONS = ['MEAL_TIME', 'ROMANTIC', 'PARTY', 'CASUAL', 'MODERN', 'CLASSIC'] as const;
    const SEASON_OPTIONS = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER', 'ALL'] as const;
    const STYLE_OPTIONS = ['LIGHT', 'STANDARD', 'SPECIAL', 'STRONG', 'CLASSIC'] as const;
    const ABV_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'] as const;

    const recommend = async(answers: number[]) => {
        try {
            console.log("RecommendViewModel_recommend 실행")

            const request = {
                flavor:   FLAVOR_OPTIONS[answers[0]! - 1],
                mood: MOOD_OPTIONS[answers[1]! - 1],
                season: SEASON_OPTIONS[answers[2]! - 1],
                style: STYLE_OPTIONS[answers[3]! - 1],
                abvBand: ABV_OPTIONS[answers[4]! - 1],
            };
            const respond = await repository.recommend(request)
            return respond

        } catch(e) {
            console.log('추천 실패', e);
            return null
        }
    }


    return {
        textIdx, setTextIdx, recommend
    }
}

export default VideoViewModel;