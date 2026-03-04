import { useCallback, useEffect, useRef, useState } from 'react';
import { ISearchRepository } from '../../model/repository/SearchRepository';
import { CocktailCard } from '../../model/domain/CocktailCard';
import { di } from '../../DI/Container';
import axios from 'axios';
import { DEFAULT_FILTER, FilterState } from '../../Components/BottomSheet/FilterBottomSheet/FilterBottomSheetViewModel';
import instance from '../../tokenRequest/axios_interceptor';
import Toast from 'react-native-toast-message';

type UseSearchResultDeps = {
    repository?: ISearchRepository;
};

const useAllCocktailViewModel = (keyword?: string, deps?: UseSearchResultDeps) => {
    const [results, setResults] = useState<CocktailCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLast, setIsLast] = useState(false);
    const [appliedFilter, setAppliedFilter] = useState<FilterState>(DEFAULT_FILTER);

    // ref로 최신 값 추적 → useCallback deps에서 loading/page/isLast 제거
    const pageRef = useRef(0);
    const isLastRef = useRef(false);
    const loadingRef = useRef(false);

    const repository = deps?.repository ?? di.cocktailSearchRepository;

    const fetchResult = useCallback(async (filter?: FilterState, isNextPage = false) => {
        if (loadingRef.current || (isNextPage && isLastRef.current)) { return; }

        loadingRef.current = true;
        setLoading(true);

        try {
            const targetPage = isNextPage ? pageRef.current + 1 : 0;
            const targetFilter = filter ?? appliedFilter;
            const abvParam = targetFilter.degree || undefined;
            const styleParam = targetFilter.style || undefined;
            const tasteParam = targetFilter.taste.length > 0 ? targetFilter.taste : undefined;
            const baseParam = targetFilter.base.length > 0 ? targetFilter.base : undefined;
            const sortParam = targetFilter.sort;

            const data = await repository.search(
                keyword?.trim(),
                abvParam,
                styleParam,
                tasteParam,
                baseParam,
                sortParam,
                targetPage,
                10,
            );

            if (isNextPage) {
                setResults(prev => [...prev, ...data]);
                pageRef.current = targetPage;
            } else {
                setResults(data);
                pageRef.current = 0;
                isLastRef.current = false;
                setIsLast(false);
            }

            const last = data.length < 10;
            isLastRef.current = last;
            setIsLast(last);
        } catch (err) {
            setError('에러가 발생했습니다.');
            if (axios.isAxiosError(err)) {
                console.log(' AxiosError message:', err.message);
                console.log(' AxiosError code:', err.code);
                console.log(' AxiosError response:', err.response?.data);
                console.log(' AxiosError status:', err.response?.status);
            } else {
                console.log(' Unknown error:', err);
            }
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    // appliedFilter는 useEffect에서 직접 넘기므로 deps에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword, repository]);

    const loadMore = useCallback(() => {
        fetchResult(undefined, true);
    }, [fetchResult]);

    const refetch = useCallback((filter?: FilterState) => {
        if (filter) { setAppliedFilter(filter); }
        fetchResult(filter, false);
    }, [fetchResult]);

    const bookmarked = useCallback(async (cocktailId: number) => {
        setResults(prev =>
            prev.map(item =>
                item.id === cocktailId
                    ? { ...item, isBookmarked: !item.isBookmarked }
                    : item
            )
        );
        try {
            await instance.post(`/api/v2/cocktails/${cocktailId}/bookmarks`);
        } catch {
            Toast.show({
                type: 'error',
                text1: '로그인 후 북마크 사용이 가능합니다.',
            });
            fetchResult(undefined, false);
        }
    }, [fetchResult]);

    useEffect(() => {
        fetchResult(appliedFilter, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword, appliedFilter]);

    return {
        results,
        loading,
        error,
        appliedFilter,
        isLast,
        refetch,
        loadMore,
        bookmarked,
    };
};

export default useAllCocktailViewModel;
