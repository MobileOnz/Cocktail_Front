import { useCallback, useEffect, useState } from 'react';
import { ICocktailDetailRepository } from '../../model/Repository/CocktailDetailRepository';
import { CocktailDetail } from '../../model/domain/CocktailDetail';
import { di } from '../../DI/Container';
import { getToken } from '../../tokenRequest/Token';
import Toast from 'react-native-toast-message';


type UseCocktailDetailDeps = {
    repository?: ICocktailDetailRepository;
};

const useCocktailDetailViewModel = (id: number, deps?: UseCocktailDetailDeps) => {
    const [detail, setDetail] = useState<CocktailDetail>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const repository = deps?.repository ?? di.cocktailDetailRepository;

    const toggleReaction = useCallback(async (reactionType: 'RECOMMEND' | 'HARD') => {
        const token = await getToken();
        if (!token) {
            Toast.show({ type: 'info', text1: '로그인 후 이용해 주세요.' });
            return;
        }

        if (!detail) return;

        const previousReaction = detail.isReactioned;
        const nextReaction = previousReaction === reactionType ? 'NONE' : reactionType;

        setDetail(prev => prev ? ({
            ...prev,
            isReactioned: nextReaction
        }) : prev);

        try {
            await repository.postCocktailReaction(id, nextReaction);
            console.log("반응 업데이트 성공:", nextReaction);
        } catch (err: any) {
            setDetail(prev => prev ? ({
                ...prev,
                isReactioned: previousReaction
            }) : prev);
            console.log("--------- ❌ 반응 업데이트 에러 상세 ---------");
            if (err.response) {
                // 서버가 응답을 보냈으나 4xx, 5xx 에러인 경우
                console.log("상태 코드 (Status):", err.response.status);
                console.log("서버 메시지 (Data):", err.response.data);
                console.log("요청 URL:", err.config?.url);
                console.log("보낸 데이터 (Payload):", err.config?.data);
            } else if (err.request) {
                // 요청은 보냈으나 응답을 받지 못한 경우 (네트워크 에러 등)
                console.log("응답 없음 (No Response):", err.request);
            } else {
                // 설정 단계에서 에러가 발생한 경우
                console.log("에러 메시지:", err.message);
            }
            console.log("--------------------------------------------");
            Toast.show({ type: 'error', text1: '업데이트에 실패했습니다.' });
        }
    }, [detail, id, repository]);


    const fetchDetail = useCallback(async () => {

        try {
            setLoading(true);
            const [info, reaction] = await Promise.all([
                repository.getDetailData(id),
                repository.getCocktailReaction(id).catch(err => {
                    console.log("비로그인 또는 권한 없음으로 인한 반응 조회 스킵");
                    return 'NONE';
                })
            ]);
            console.log("reaction 데이터:", reaction);
            setDetail({
                ...info,
                isReactioned: reaction ?? 'NONE'
            });
        } catch (error) {
            console.log(error);
            setError('에러가 발생했습니다');
        }
        finally {
            setLoading(false);
        }

    }, [id, repository]);


    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);


    return {
        toggleReaction,
        detail,
        loading,
        error,
    };

};
export default useCocktailDetailViewModel;
