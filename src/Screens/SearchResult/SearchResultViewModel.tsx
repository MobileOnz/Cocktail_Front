import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CocktailCard } from '../../model/domain/CocktailCard';
import axios from 'axios';
import perf from '@react-native-firebase/perf';
import { di } from '../../DI/Container';
import { ISearchRepository } from '../../model/repository/SearchRepository';
import { DEFAULT_FILTER, FilterState } from '../../Components/BottomSheet/FilterBottomSheet/FilterBottomSheetViewModel';
import instance from '../../tokenRequest/axios_interceptor';
import Toast from 'react-native-toast-message';

type UseSearchResultDeps = {
    repository?: ISearchRepository;
};

const fetchSearchResult = async (
    keyword: string,
    filter: FilterState,
    repository: ISearchRepository,
): Promise<CocktailCard[]> => {
    const trace = await perf().newTrace('SearchResult_Load');
    await trace.start();
    try {
        const data = await repository.search(
            keyword?.trim(),
            filter.degree || undefined,
            filter.style || undefined,
            filter.taste.length > 0 ? filter.taste : undefined,
            filter.base.length > 0 ? filter.base : undefined,
            filter.sort,
        );
        await trace.stop();
        return data;
    } catch (error) {
        await trace.stop();
        if (axios.isAxiosError(error)) {
            console.log('AxiosError:', error.message, error.response?.status);
        }
        throw error;
    }
};

const useSearchResultViewModel = (keyword: string, deps?: UseSearchResultDeps) => {
    const repository = deps?.repository ?? di.cocktailSearchRepository;
    const queryClient = useQueryClient();
    const [appliedFilter, setAppliedFilter] = useState<FilterState>(DEFAULT_FILTER);

    // 검색 결과: 5분 캐시 (같은 키워드+필터 재검색 시 캐시 활용)
    const { data, isLoading, error } = useQuery({
        queryKey: ['searchResult', keyword, appliedFilter],
        queryFn: () => fetchSearchResult(keyword, appliedFilter, repository),
        staleTime: 1000 * 60 * 5, // 5분
        enabled: !!keyword,
    });

    const applyFilter = (filter: FilterState) => {
        setAppliedFilter(filter);
    };

    const bookmarked = useCallback(async (cocktailId: number) => {
        // 캐시에서 직접 북마크 토글 (낙관적 UI)
        queryClient.setQueryData(
            ['searchResult', keyword, appliedFilter],
            (old: any) => {
                if (!old) { return old; }
                return old.map((item: any) =>
                    item.id === cocktailId
                        ? { ...item, isBookmarked: !item.isBookmarked }
                        : item,
                );
            },
        );

        try {
            await instance.post(`/api/v2/cocktails/${cocktailId}/bookmarks`, undefined, { authPrompt: true });
        } catch {
            Toast.show({ type: 'error', text1: '로그인 후 북마크 사용이 가능합니다.' });
            queryClient.invalidateQueries({ queryKey: ['searchResult', keyword, appliedFilter] });
        }
    }, [queryClient, keyword, appliedFilter]);

    return {
        results: data ?? [],
        loading: isLoading,
        error: error ? '검색 중 오류가 발생했습니다.' : null,
        refetch: applyFilter,
        appliedFilter,
        bookmarked,
    };
};

export default useSearchResultViewModel;
