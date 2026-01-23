import { useCallback, useEffect, useState } from 'react';
import { ICocktailDetailRepository } from '../../model/Repository/CocktailDetailRepository';
import { CocktailDetail } from '../../model/domain/CocktailDetail';
import { di } from '../../DI/Container';
import { CocktailCard } from '../../model/domain/CocktailCard';
import instance from '../../tokenRequest/axios_interceptor';

import Toast from 'react-native-toast-message';
import { getToken } from '../../tokenRequest/Token';


type UseCocktailDetailDeps = {
    repository?: ICocktailDetailRepository;
};

type ReactionType = 'RECOMMEND' | 'HARD';

const useCocktailDetailViewModel = (id: number, deps?: UseCocktailDetailDeps) => {
    const [detail, setDetail] = useState<CocktailDetail>();
    const [recommendedCocktails, setRecommendedCocktails] = useState<CocktailCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [myReaction, setMyReaction] = useState<ReactionType | null>(null);

    const repository = deps?.repository ?? di.cocktailDetailRepository;

    const checkToken = async () => {
        const token = await getToken();
        console.log('현재 API 요청에 사용할 토큰:', token);
        if (!token) {
            Toast.show({
                type: 'error',
                text1: '로그인이 필요합니다.',
            });
            return false;
        }
        return true;
    };


    const fetchDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        const token = await getToken();

        try {
            const [detailData, reactionRes] = await Promise.all([
                repository.getDetailData(id),
                token ? repository.fetchCocktailRecommendations(id.toString()) : Promise.resolve(null),
            ]);
            console.log('서버에서 온 상세 데이터:', detailData);
            setDetail(detailData);

            console.log('서버에서 받아온 리액션 값:', reactionRes);
            if (reactionRes) {
                setMyReaction(reactionRes as ReactionType);
            } else {
                setMyReaction(null);
            }



            if (detailData?.style) {
                const recommendData = await repository.recommendCocktails(detailData.style);
                setRecommendedCocktails(recommendData);
            }
        } catch (error) {
            console.log(error);
            setError('에러가 발생했습니다');
        }
        finally {
            setLoading(false);
        }

    }, [id, repository]);

    const handleReaction = async (type: ReactionType) => {
        if (!(await checkToken())) { return; }

        const prev = myReaction;
        const next = myReaction === type ? null : type;
        setMyReaction(next);

        try {

            const res = await repository.postCocktailRecommendation(id.toString(), type);
            console.log(`[Reaction 성공] 타입: ${type}`, res);
        } catch (e) {
            setMyReaction(prev);
            Toast.show({
                type: 'error',
                text1: '반응을 등록하지 못했습니다.',

            });
        }
    };

    const bookmarked = async (cocktailId: number) => {

        if (!(await checkToken())) { return; }

        //바로 아이템 표시를 위해 낙관적 UI 구조 활용
        const toggleBookmarkInList = (list: CocktailCard[]) =>
            list.map(item =>
                item.id === cocktailId
                    ? { ...item, isBookmarked: !item.isBookmarked }
                    : item
            );

        setRecommendedCocktails(prev => toggleBookmarkInList(prev));
        if (detail && detail.id === cocktailId) {
            setDetail({ ...detail, isBookmarked: !detail.isBookmarked });
        }



        try {
            const res = await instance.post(`/api/v2/cocktails/${cocktailId}/bookmarks`);

            console.log('북마크 클릭 성공 응답:', res.data);

        } catch (error: any) {
            console.error('북마크 처리 중 에러 발생:', error);
            console.log('에러 데이터:', error.response.data);
            console.log('에러 상태코드:', error.response.status);
            console.log('에러 헤더:', error.response.headers);
            await fetchDetail();
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return {
        detail,
        loading,
        error,
        recommendedCocktails,
        bookmarked,
        handleReaction,
        myReaction,
    };

};
export default useCocktailDetailViewModel;
