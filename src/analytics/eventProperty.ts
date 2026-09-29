import { track } from '@amplitude/analytics-react-native';

// Only this versioned, aggregate-event contract may cross the WebView boundary.
const recommendationAnswers: Record<string, readonly string[]> = {
    taste: ['SWEET', 'SOUR', 'BITTER', 'BALANCED', 'UNKNOWN'],
    aroma: ['CITRUS', 'FRUIT', 'BERRY', 'HERBAL', 'COFFEE', 'CREAMY', 'DEEP', 'UNKNOWN'],
    alcohol: ['BARELY', 'MILD', 'MEDIUM', 'STRONG', 'UNKNOWN'],
    texture: ['FIZZY', 'LIGHT', 'BALANCED', 'RICH', 'UNKNOWN'],
    occasion: ['PARTY', 'MEAL', 'DESSERT', 'SLOW', 'REFRESH', 'APERITIF', 'BRUNCH', 'UNKNOWN'],
    adventure: ['1', '2', '3', '4', '5'],
};
const recommendationFields: Record<string, readonly string[]> = {
    recommendation_started: [],
    submit_answer_recommend: ['question_step', 'question_key', 'answer_code'],
    recommendation_requested: ['request_id'],
    recommendation_result_viewed: ['request_id', 'result_count'],
    recommendation_detail_expanded: ['request_id', 'cocktail_id', 'position'],
    recommendation_failed: ['request_id', 'failure_stage', 'error_code'],
};

export function trackRecommendationMessage(raw: string, seen: Set<string>) {
    if (raw.length > 2048) { return; }
    try {
        const message = JSON.parse(raw);
        if (message?.type !== 'onz:analytics' ||
            !Object.prototype.hasOwnProperty.call(recommendationFields, message.event)) { return; }
        const p = message.properties;
        const uuid = (v: unknown) => typeof v === 'string' &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
        if (!p || p.flow_version !== 'web_v1_six_questions' ||
            !uuid(p.recommendation_session_id) || !uuid(p.event_id) || seen.has(p.event_id)) { return; }
        const fields = recommendationFields[message.event];
        const common = ['flow_version', 'recommendation_session_id', 'event_id'];
        if (Object.keys(p).some(key => !common.includes(key) && !fields.includes(key))) { return; }
        const positive = (v: unknown) => typeof v === 'number' && Number.isSafeInteger(v) && v > 0;
        if (fields.includes('request_id') &&
            !(message.event === 'recommendation_failed' && p.failure_stage === 'validation') &&
            !uuid(p.request_id)) { return; }
        if (message.event === 'submit_answer_recommend' &&
            (!positive(p.question_step) || Object.keys(recommendationAnswers)[p.question_step - 1] !== p.question_key ||
             !recommendationAnswers[p.question_key]?.includes(p.answer_code))) { return; }
        if (message.event === 'recommendation_result_viewed' && !positive(p.result_count)) { return; }
        if (message.event === 'recommendation_detail_expanded' &&
            (!positive(p.position) || typeof p.cocktail_id !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(p.cocktail_id))) { return; }
        if (message.event === 'recommendation_failed') {
            const errors: Record<string, readonly string[]> = {
                validation: ['invalid_answers'], request: ['network_error', 'timeout'],
                response: ['http_error', 'invalid_response', 'empty_results'], render: ['render_error'],
            };
            if (!errors[p.failure_stage]?.includes(p.error_code) ||
                (p.failure_stage === 'validation' && p.request_id !== undefined)) { return; }
        }
        seen.add(p.event_id);
        // Retained for this WebView screen lifetime; repeated user actions have new IDs.
        try {
            void track(message.event, p, {insert_id: p.event_id}).promise.catch(() => {});
        } catch { seen.delete(p.event_id); }
    } catch { /* Malformed messages must not affect navigation. */ }
}

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

export function stay10sPageCocktailDetail(params: {
    cocktailId: number;
    cocktailName: string;
    entryOrigin: string;
}) {
    track('stay10s_page_cocktaildetail', {
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
    track('view_page_recommend', {
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
        cocktail_name: params.cocktailName,
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
export function completePageGuidedetail(params: {
    guideId: number;
    guideTitle: string;
    guideType: string;
    entryOrigin: string;
}) {
    track('complete_page_guidedetail', {
        guide_id: params.guideId,
        guide_title: params.guideTitle,
        guide_type: params.guideType,
        entry_origin: params.entryOrigin,
    });
}
