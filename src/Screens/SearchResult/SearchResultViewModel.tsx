import { useCallback, useEffect, useState } from 'react';
import { CocktailCard } from '../../model/domain/CocktailCard';
import axios from 'axios';
import { di } from '../../DI/Container';
import { ISearchRepository } from '../../model/repository/SearchRepository';
import { DEFAULT_FILTER, FilterState } from '../../Components/BottomSheet/FilterBottomSheet/FilterBottomSheetViewModel';

type UseSearchResultDeps = {
    repository?: ISearchRepository;
};

const useSearchResultViewModel = (keyword: string, deps?: UseSearchResultDeps) => {
    const [results, setResults] = useState<CocktailCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [appliedFilter, setAppliedFilter] = useState<FilterState>(DEFAULT_FILTER);

    const repository = deps?.repository ?? di.cocktailSearchRepository;


    const fetchResult = useCallback(async (filter?: FilterState) => {
        setLoading(true);
        setError(null);
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
                sortParam
            );

            setResults(data);
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

    }, [keyword, repository, appliedFilter]);

    useEffect(() => {
        fetchResult();
    }, [fetchResult]);

    return {
        results,
        loading,
        error,
        refetch: fetchResult,
        appliedFilter,
    };

};

export default useSearchResultViewModel;
