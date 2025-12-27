import { useMemo, useState } from "react";
import { CocktailRecommendRepository } from "../../model/Repository/CocktailRecommendRepository";
import { RecommendCocktailDataSource } from "../../model/DataSource/RecommendCocktailDataSource";
import { CocktailDetail } from "../../model/domain/CocktailDetail";

const RecommendationViewModel = () => {
    const repository = useMemo(
        () =>
          new CocktailRecommendRepository(
            new RecommendCocktailDataSource(),
          ),
    []);

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([null, null, null, null, null]);
    const [result, setResult] = useState<CocktailDetail | null>(null)
    const [loading, setLoading] = useState(false)

    const FLAVOR_OPTIONS = ['SWEET', 'SPARKLING', 'CITRUS', 'TROPICAL', 'BITTER', 'SPICY', 'HERBAL'] as const;
    const MOOD_OPTIONS = ['MEAL_TIME', 'ROMANTIC', 'PARTY', 'CASUAL', 'MODERN', 'CLASSIC'] as const;
    const SEASON_OPTIONS = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER', 'ALL'] as const;
    const STYLE_OPTIONS = ['LIGHT', 'STANDARD', 'SPECIAL', 'STRONG', 'CLASSIC'] as const;
    const ABV_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'] as const;

    const recommend = async() => {
        try {
            setLoading(true)
            console.log("RecommendViewModel_recommend 실행")
            
            selectedAnswers.map( (id)=> {
                console.log(id)
            })

            const request = {
                flavor:   FLAVOR_OPTIONS[selectedAnswers[0]! - 1],
                mood: MOOD_OPTIONS[selectedAnswers[1]! - 1],
                season: SEASON_OPTIONS[selectedAnswers[2]! - 1],
                style: STYLE_OPTIONS[selectedAnswers[3]! - 1],
                abvBand: ABV_OPTIONS[selectedAnswers[4]! - 1],
            };
            const respond = await repository.recommend(request)

            setResult(respond)


        } catch(e) {
            console.log("추천 실패")
        } finally {
            setLoading(false);
        }

        
    }


    return {
        currentStep, setCurrentStep, selectedAnswers, setSelectedAnswers, loading, recommend, result, setResult
    }
}

export default RecommendationViewModel;