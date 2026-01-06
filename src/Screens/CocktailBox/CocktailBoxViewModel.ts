import { useCallback, useEffect, useState } from 'react';
import { CocktailCard } from '../../model/domain/CocktailCard';
import { IBookmarkRepository } from '../../model/repository/BookmarkRepository';
import { di } from '../../DI/Container';

type UseCocktailBoxDeps = {
    repository?: IBookmarkRepository;
};

const useCocktailBoxViewModel = (deps?: UseCocktailBoxDeps) => {
    const repository = deps?.repository ?? di.bookmarkRepository;
    const [results, setResults] = useState<CocktailCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBookmarkedCocktails = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await repository?.fetchBookmarked();
            setResults(data || []);
            setLoading(false);
        } catch (error) {
            console.log('Error fetching bookmarked cocktails:', error);
            setError('다시 시도해주세요.');
        }
    }, [repository]);

    useEffect(() => {
        fetchBookmarkedCocktails();
    }, [fetchBookmarkedCocktails]);

    return {
        results,
        loading,
        error,
        fetchBookmarkedCocktails,
    };
};

export default useCocktailBoxViewModel;
