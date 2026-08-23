import { useCallback, useEffect, useRef, useState } from 'react';
import { CocktailCard } from '../../model/domain/CocktailCard';
import { IBookmarkRepository } from '../../model/repository/BookmarkRepository';
import { di } from '../../DI/Container';
import type { ArchiveTab } from '../../model/DataSource/BookMarksDataSource';

type UseCocktailBoxDeps = {
    repository?: IBookmarkRepository;
};

const useCocktailBoxViewModel = (deps?: UseCocktailBoxDeps) => {
    const repository = deps?.repository ?? di?.bookmarkRepository;
    const [tab, setTab] = useState<ArchiveTab>('BOOKMARK');
    const tabRef = useRef<ArchiveTab>('BOOKMARK');
    const [results, setResults] = useState<CocktailCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBookmarkedCocktails = useCallback(async () => {
        setLoading(true);
        setError(null);
        // 탭을 바꾸면 이전 탭 응답이 늦게 도착해 섞일 수 있다.
        const requested = tab;
        try {
            const data = await repository?.fetchArchive(requested);
            if (requested !== tabRef.current) { return; }
            setResults(data || []);
        } catch (e) {
            if (requested !== tabRef.current) { return; }
            console.log('보관함 조회 실패:', e);
            setResults([]);
            setError('다시 시도해주세요.');
        } finally {
            if (requested === tabRef.current) { setLoading(false); }
        }
    }, [repository, tab]);

    useEffect(() => {
        tabRef.current = tab;
    }, [tab]);

    useEffect(() => {
        fetchBookmarkedCocktails();
    }, [fetchBookmarkedCocktails]);

    return {
        results,
        loading,
        error,
        tab,
        setTab,
        fetchBookmarkedCocktails,
    };
};

export default useCocktailBoxViewModel;
