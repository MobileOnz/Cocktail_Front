import { useState } from 'react';
import { submitAnswerRecommend } from '../../analytics/eventProperty';
import { FLOW_ID } from '@env';
// import { CocktailRecommendRepository } from "../../model/Repository/CocktailRecommendRepository";
// import { RecommendCocktailDataSource } from "../../model/DataSource/RecommendCocktailDataSource";

const RecommendationViewModel = () => {
    // const repository = useMemo(
    //     () =>
    //       new CocktailRecommendRepository(
    //         new RecommendCocktailDataSource(),
    //       ),
    // []);

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([null, null, null, null, null]);
    const OPTIONS = [
        ['sweet', 'sparkling', 'citrus', 'tropical', 'bitter', 'spicy', 'herbal'],
        ['meal_time', 'romantic', 'party', 'casual', 'modern', 'classic'],
        ['spring', 'summer', 'autumn', 'winter', 'all'],
        ['light', 'standard', 'special', 'strong', 'classic'],
        ['low', 'medium', 'high'],
    ];


    const submitAmplifyRecommend = () => {
        submitAnswerRecommend({
            questionStep: currentStep + 1,
            answerCode: 'q' + (currentStep + 1) + '_' + OPTIONS[currentStep][selectedAnswers[currentStep]! - 1],
            recommendFlowId: FLOW_ID,
        });
    };



    return {
        currentStep, setCurrentStep, selectedAnswers, setSelectedAnswers, submitAmplifyRecommend,
    };
};

export default RecommendationViewModel;
