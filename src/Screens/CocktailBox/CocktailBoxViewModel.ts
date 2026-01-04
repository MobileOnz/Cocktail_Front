import { useState } from 'react';
import { CocktailCard } from '../../model/domain/CocktailCard';
import { IBookmarkRepository } from '../../model/repository/BookmarkRepository';

type UseCocktailBoxDeps = {
    repository?: IBookmarkRepository;
};

const useCocktailBoxViewModel = (deps?: { bookmarkRepository?: UseCocktailBoxDeps }) => {
    const [results, setResults] = useState<CocktailCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const repository = deps?.bookmarkRepository?.repository;

    const fetchBookmarkedCocktails = async () => {
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
    };

    return {
        results,
        loading,
        error,
        fetchBookmarkedCocktails,
    };
};

export default useCocktailBoxViewModel;
