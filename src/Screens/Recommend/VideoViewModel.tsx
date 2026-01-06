import { useMemo, useState } from "react";
import { CocktailRecommendRepository } from "../../model/repository/CocktailRecommendRepository";
import { RecommendCocktailDataSource } from "../../model/DataSource/RecommendCocktailDataSource";
import { viewPageRecommend } from "../../analytics/eventProperty";
import { FLOW_ID } from "@env";

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

    const recommend = async (answers: number[]) => {
        try {
            const request = {
                flavor: FLAVOR_OPTIONS[answers[0]! - 1],
                mood: MOOD_OPTIONS[answers[1]! - 1],
                season: SEASON_OPTIONS[answers[2]! - 1],
                style: STYLE_OPTIONS[answers[3]! - 1],
                abvBand: ABV_OPTIONS[answers[4]! - 1],
            };
            const respond = await repository.recommend(request)
            return respond

        } catch (e) {
            return null
        }
    }

    const viewPageRecommendation = (answers: number[]) => {
        viewPageRecommend({
            recommendFlowId: FLOW_ID,
            answerQ1Code: "q1_" + FLAVOR_OPTIONS[answers[0]! - 1].toLowerCase(),
            answerQ2Code: "q2_" + MOOD_OPTIONS[answers[1]! - 1].toLowerCase(),
            answerQ3Code: "q3_" + SEASON_OPTIONS[answers[2]! - 1].toLowerCase(),
            answerQ4Code: "q4_" + STYLE_OPTIONS[answers[3]! - 1].toLowerCase(),
            answerQ5Code: "q5_" + ABV_OPTIONS[answers[4]! - 1].toLowerCase()
        })
    }


    return {
        textIdx, setTextIdx, recommend, viewPageRecommendation
    }
}

export default VideoViewModel;