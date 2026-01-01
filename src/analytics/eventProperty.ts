import { track } from '@amplitude/analytics-react-native';

// 홈
export function trackViewHomeOncePerSession(params: {
    userType: string;
    loginStatus: string;
}) {
    track('view_page_home', {
        user_type: params.userType,
        login_status: params.loginStatus,
    });
}

// 상세 정보
export function trackViewCocktailDetail(params: {
    cocktailId: number;
    cocktailName: string;
    entryOrigin: string;
}) {
    track('view_page_cocktaildetail', {
        cocktail_id: params.cocktailId,
        cocktail_name: params.cocktailName,
        entry_origin: params.entryOrigin,
    });
}

export function startStay3sCocktailDetail(params: {
    cocktailId: number;
    cocktailName: string;
    entryOrigin: string;
}) {
    track('stay3s_view_cocktaildetail', {
        cocktail_id: params.cocktailId,
        cocktail_name: params.cocktailName,
        entry_origin: params.entryOrigin,
    });

}

// 칵테일 추천

export function submitAnswerRecommend(params: {
    questionStep: number;
    answerCode: string;
    recommendFlowId: string;
}) {
    track('submit_answer_recommend', {
        question_step: params.questionStep,
        answer_code: params.answerCode,
        recommend_flow_id: params.recommendFlowId,
    });

}

export function viewPageRecommend(params: {
    recommendFlowId: string;
    answerQ1Code: string;
    answerQ2Code: string;
    answerQ3Code: string;
    answerQ4Code: string;
    answerQ5Code: string;
}) {
    track('stay3s_view_cocktaildetail', {
        recommend_flow_id: params.recommendFlowId,
        answer_q1_code: params.answerQ1Code,
        answer_q2_code: params.answerQ2Code,
        answer_q3_code: params.answerQ3Code,
        answer_q4_code: params.answerQ4Code,
        answer_q5_code: params.answerQ5Code,
    });

}

export function clickCtaRecommendresult(params: {
    cocktailId: number;
    cocktailName: string;
    answerQ1Code: string;
    answerQ2Code: string;
    answerQ3Code: string;
    answerQ4Code: string;
    answerQ5Code: string;
    recommendFlowId: string;
}) {
    track('click_cta_recommendresult', {
        cocktail_id: params.cocktailId,
        answer_q1_code: params.answerQ1Code,
        answer_q2_code: params.answerQ2Code,
        answer_q3_code: params.answerQ3Code,
        answer_q4_code: params.answerQ4Code,
        answer_q5_code: params.answerQ5Code,
        recommend_flow_id: params.recommendFlowId,
    });

}


// 칵테일 가이드
export function viewPageGuidedetail(params: {
    guideId: number;
    guideTitle: string;
    guideType: string;
    entryOrigin: string;
}) {
    track('view_page_guidedetail', {
        guide_id: params.guideId,
        guide_title: params.guideTitle,
        guide_type: params.guideType,
        entry_origin: params.entryOrigin,
    });

}
export function stay3sViewGuidedetail(params: {
    guideId: number;
    guideTitle: string;
    guideType: string;
    entryOrigin: string;
}) {
    track('stay3s_view_guidedetail', {
        guide_id: params.guideId,
        guide_title: params.guideTitle,
        guide_type: params.guideType,
        entry_origin: params.entryOrigin,
    });

}
