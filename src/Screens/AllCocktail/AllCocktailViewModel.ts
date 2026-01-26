import { useCallback, useEffect, useState } from 'react';
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
    const [page, _setPage] = useState(0);
    const [isLast, setIsLast] = useState(false);
    const [appliedFilter, setAppliedFilter] = useState<FilterState>(DEFAULT_FILTER);

    const repository = deps?.repository ?? di.cocktailSearchRepository;

    const bookmarked = async (cocktailId: number) => {
        setResults(prev =>
            prev.map(item =>
                item.id === cocktailId
                    ? { ...item, isBookmarked: !item.isBookmarked }
                    : item
            )
        );

        try {
            await instance.post(`/api/v2/cocktails/${cocktailId}/bookmarks`);
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: '로그인 후 북마크 사용이 가능합니다.',
            });
            fetchResult(undefined, false);
        }
    };


    const fetchResult = useCallback(async (filter?: FilterState, isNextPage = false) => {
        if (loading || (isNextPage && isLast)) { return; }

        setLoading(true);
        setError(null);
        const targetPage = isNextPage ? page + 1 : 0;
        if (filter) { setAppliedFilter(filter); }
        try {
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
            } else {
                setResults(data);
            }

            if (data.length < 10) {
                setIsLast(true);
            } else {
                setIsLast(false);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(' AxiosError message:', error.message);
                console.log(' AxiosError code:', error.code);
                console.log(' AxiosError config:', error.config);
                console.log(' AxiosError request:', error.request);
                console.log(' AxiosError response:', error.response?.data);
                console.log(' AxiosError status:', error.response?.status);
            } else {
                console.log(' Unknown error:', error);
            }
        }
        finally {
            setLoading(false);
        }

    }, [keyword, repository, appliedFilter, page, isLast, loading]);

    useEffect(() => {
        fetchResult(undefined, false);
    }, [keyword, fetchResult]);

    return {
        results,
        loading,
        error,
        appliedFilter,
        isLast,
        refetch: (filter?: FilterState) => fetchResult(filter, false),
        loadMore: () => fetchResult(undefined, true),
        bookmarked,
    };

};

export default useAllCocktailViewModel;
