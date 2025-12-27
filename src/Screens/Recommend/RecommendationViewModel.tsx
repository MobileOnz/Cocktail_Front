import { useState } from "react";
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

    return {
        currentStep, setCurrentStep, selectedAnswers, setSelectedAnswers
    }
}

export default RecommendationViewModel;