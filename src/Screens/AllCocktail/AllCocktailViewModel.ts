import { useCallback, useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { ISearchRepository } from '../../model/repository/SearchRepository';
import { CocktailCard } from '../../model/domain/CocktailCard';
import { di } from '../../DI/Container';
import axios from 'axios';
import { DEFAULT_FILTER, FilterState } from '../../Components/BottomSheet/FilterBottomSheet/FilterBottomSheetViewModel';
import instance from '../../tokenRequest/axios_interceptor';
import Toast from 'react-native-toast-message';
import { isAuthError } from '../../lib/auth';

const PAGE_SIZE = 10;

type UseSearchResultDeps = {
    repository?: ISearchRepository;
};

const fetchPage = async (
    filter: FilterState,
    page: number,
    repository: ISearchRepository,
    keyword?: string,
): Promise<CocktailCard[]> => {
    try {
        return await repository.search(
            keyword?.trim(),
            filter.degree || undefined,
            filter.style || undefined,
            filter.taste.length > 0 ? filter.taste : undefined,
            filter.base.length > 0 ? filter.base : undefined,
            filter.sort,
            page,
            PAGE_SIZE,
        );
    } catch (err) {
        if (axios.isAxiosError(err)) {
            console.log('AxiosError:', err.message, err.response?.status);
        }
        throw err;
    }
};

const useAllCocktailViewModel = (keyword?: string, deps?: UseSearchResultDeps) => {
    const repository = deps?.repository ?? di.cocktailSearchRepository;
    const queryClient = useQueryClient();
    const [appliedFilter, setAppliedFilter] = useState<FilterState>(DEFAULT_FILTER);

    const {
        data,
        isLoading,
        isFetchingNextPage,
        error,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: ['allCocktails', keyword, appliedFilter],
        queryFn: ({ pageParam }) => fetchPage(appliedFilter, pageParam as number, repository, keyword),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.length < PAGE_SIZE ? undefined : allPages.length,
        staleTime: 1000 * 60 * 5, // 5분
    });

    // 전체 페이지를 하나의 배열로 합침
    const results = data?.pages.flat() ?? [];

    const loadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const refetch = useCallback((filter?: FilterState) => {
        if (filter) { setAppliedFilter(filter); }
    }, []);

    const bookmarked = useCallback(async (cocktailId: number) => {
        // 캐시에서 직접 북마크 토글 (낙관적 UI)
        queryClient.setQueryData(
            ['allCocktails', keyword, appliedFilter],
            (old: typeof data) => {
                if (!old) { return old; }
                return {
                    ...old,
                    pages: old.pages.map(page =>
                        page.map(item =>
                            item.id === cocktailId
                                ? { ...item, isBookmarked: !item.isBookmarked }
                                : item,
                        ),
                    ),
                };
            },
        );

        try {
            await instance.post(`/api/v2/cocktails/${cocktailId}/bookmarks`, undefined, { authPrompt: true });
        } catch (e) {
            // 인증 실패면 인터셉터가 이미 로그인 화면으로 보냈다 — 여기선 이유만 알린다.
            // 네트워크/서버 오류에까지 "로그인 후..." 를 띄우면 원인을 오해하게 된다.
            Toast.show({
                type: 'error',
                text1: isAuthError(e) ? '로그인 후 북마크 사용이 가능합니다.' : '북마크를 반영하지 못했어요.',
            });
            queryClient.invalidateQueries({ queryKey: ['allCocktails', keyword, appliedFilter] });
        }
    }, [queryClient, keyword, appliedFilter]);

    return {
        results,
        loading: isLoading,
        isFetchingNextPage,
        error: error ? '에러가 발생했습니다.' : null,
        appliedFilter,
        isLast: !hasNextPage,
        refetch,
        loadMore,
        bookmarked,
    };
};

export default useAllCocktailViewModel;
