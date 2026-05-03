import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ICocktailDetailRepository } from '../../model/repository/CocktailDetailRepository';
import { di } from '../../DI/Container';
import instance from '../../tokenRequest/axios_interceptor';
import Toast from 'react-native-toast-message';
import { getToken } from '../../tokenRequest/Token';
import { getPerformance } from '@react-native-firebase/perf';
import { trackViewCocktailDetail, stay10sPageCocktailDetail } from '../../analytics/eventProperty';

type UseCocktailDetailDeps = {
    repository?: ICocktailDetailRepository;
};

type ReactionType = 'RECOMMEND' | 'HARD';

const fetchDetailData = async (id: number, repository: ICocktailDetailRepository) => {
    const trace = await getPerformance().newTrace('DetailScreen_Load');
    await trace.start();
    try {
        const token = await getToken();
        const [detailData, reactionRes] = await Promise.all([
            repository.getDetailData(id),
            token ? repository.fetchCocktailRecommendations(id.toString()) : Promise.resolve(null),
        ]);

        let recommendedCocktails = [];
        if (detailData?.style) {
            recommendedCocktails = await repository.recommendCocktails(detailData.style);
        }

        await trace.stop();
        return {
            detail: detailData,
            myReaction: (reactionRes as ReactionType | null) ?? null,
            recommendedCocktails,
        };
    } catch (e) {
        await trace.stop();
        throw e;
    }
};

const useCocktailDetailViewModel = (id: number, deps?: UseCocktailDetailDeps) => {
    const repository = deps?.repository ?? di.cocktailDetailRepository;
    const queryClient = useQueryClient();
    const [myReaction, setMyReaction] = useState<ReactionType | null>(null);

    // 칵테일 상세 + 추천 목록: 24시간 캐시 (레시피/재료는 거의 안 바뀜)
    const { data, isLoading, error } = useQuery({
        queryKey: ['cocktailDetail', id],
        queryFn: () => fetchDetailData(id, repository),
        staleTime: 1000 * 60 * 60 * 24, // 24시간
    });

    const checkToken = async () => {
        const token = await getToken();
        if (!token) {
            Toast.show({ type: 'error', text1: '로그인이 필요합니다.' });
            return false;
        }
        return true;
    };

    const handleReaction = async (type: ReactionType) => {
        if (!(await checkToken())) { return; }
        const prev = myReaction;
        const next = myReaction === type ? null : type;
        setMyReaction(next);
        try {
            const res = await repository.postCocktailRecommendation(id.toString(), type);
            console.log('[Reaction 성공] 추천수:', res.data.recommendCount);
            console.log('[Reaction 성공] hardCount:', res.data.hardCount);
        } catch (e) {
            setMyReaction(prev);
            Toast.show({ type: 'error', text1: '반응을 등록하지 못했습니다.' });
        }
    };

    const trackViewDetail = (entryOrigin: string) => {
        if (!data?.detail) { return; }
        trackViewCocktailDetail({
            cocktailId: data.detail.id,
            cocktailName: data.detail.korName,
            entryOrigin,
        });
    };

    const trackStay10s = (entryOrigin: string) => {
        if (!data?.detail) { return; }
        stay10sPageCocktailDetail({
            cocktailId: data.detail.id,
            cocktailName: data.detail.korName,
            entryOrigin,
        });
    };

    const bookmarked = async (cocktailId: number) => {
        if (!(await checkToken())) { return; }

        // 낙관적 UI: 캐시 직접 수정
        queryClient.setQueryData(['cocktailDetail', id], (old: typeof data) => {
            if (!old) { return old; }
            return {
                ...old,
                detail: old.detail?.id === cocktailId
                    ? { ...old.detail, isBookmarked: !old.detail.isBookmarked }
                    : old.detail,
                recommendedCocktails: old.recommendedCocktails.map(item =>
                    item.id === cocktailId ? { ...item, isBookmarked: !item.isBookmarked } : item,
                ),
            };
        });

        // 홈 캐시도 동기화
        queryClient.invalidateQueries({ queryKey: ['homeData'] });

        try {
            await instance.post(`/api/v2/cocktails/${cocktailId}/bookmarks`);
        } catch (error: any) {
            console.error('북마크 처리 중 에러:', error);
            queryClient.invalidateQueries({ queryKey: ['cocktailDetail', id] });
        }
    };

    return {
        detail: data?.detail,
        loading: isLoading,
        error: error ? '에러가 발생했습니다' : null,
        recommendedCocktails: data?.recommendedCocktails ?? [],
        bookmarked,
        handleReaction,
        myReaction: data?.myReaction ?? myReaction,
        trackViewDetail,
        trackStay10s,
    };
};

export default useCocktailDetailViewModel;
