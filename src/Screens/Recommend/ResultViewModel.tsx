import { clickCtaRecommendresult } from "../../analytics/eventProperty";
import { FLOW_ID } from "@env";

const ResultViewModel = () => {

    const OPTIONS = [
        ['sweet', 'sparkling', 'citrus', 'tropical', 'bitter', 'spicy', 'herbal'],
        ['meal_time', 'romantic', 'party', 'casual', 'modern', 'classic'],
        ['spring', 'summer', 'autumn', 'winter', 'all'],
        ['light', 'standard', 'special', 'strong', 'classic'],
        ['low', 'medium', 'high']
    ]

    
    const clickCtaRecommendResult = (id: number, name: string, answers: number[]) => {
        clickCtaRecommendresult({
            cocktailId: id, 
            cocktailName: name,
            answerQ1Code: "q1_" + OPTIONS[0][answers[0]! - 1],
            answerQ2Code: "q2_" + OPTIONS[1][answers[1]! - 1],
            answerQ3Code: "q3_" + OPTIONS[2][answers[2]! - 1],
            answerQ4Code: "q4_" + OPTIONS[3][answers[3]! - 1],
            answerQ5Code: "q5_" + OPTIONS[4][answers[4]! - 1],
            recommendFlowId: FLOW_ID
        })
    }

    return {
        clickCtaRecommendResult
    }
}

export default ResultViewModel;