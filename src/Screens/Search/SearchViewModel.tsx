// src/viewmodels/SearchViewModel.ts
import { useCallback, useEffect, useState } from 'react';
import { RootStackParamList } from '../../Navigation/Navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { searchKeywords } from '../../model/repository/KeywordRepository';
import { Keyword } from '../../model/dto/KeywordDto';
import instance from '../../tokenRequest/axios_interceptor';
import { useFocusEffect } from '@react-navigation/native';

export type SearchLog = {
    keyword: string;
    search_type: 'NAME' | 'MENU';
};

type Navigation = StackNavigationProp<RootStackParamList, 'SearchScreen'>;

type UseSearchViewModelParams = {
    navigation: Navigation;
    initialKeyword?: string;
};

export const useSearchViewModel = ({
    navigation,
    initialKeyword,
}: UseSearchViewModelParams) => {
    const [searchText, setSearchText] = useState('');
    const [suggestions, setSuggestions] = useState<Keyword[]>([]);
    const [recentNameSearches, _setRecentNameSearches] = useState<SearchLog[]>([]);
    const [recentMenuSearches, _setRecentMenuSearches] = useState<SearchLog[]>([]);
    const [recentSearches, setRecentSearches] = useState<any[]>([]);

    /**  검색어 변경 시 실시간 추천 검색어 로드 */
    const handleSearchTextChange = async (text: string) => {

        setSearchText(text);

        if (text.trim().length > 0) {
            try {
                const list = await searchKeywords(text);


                setSuggestions(list);

                console.log('[VM] 검색어:', text, '가져온 추천수:', list.length);
            } catch (e) {
                console.log('[VM] 자동완성 로드 중 오류:', e);
                setSuggestions([]);
            }
        } else {
            // 검색어를 다 지웠을 경우 추천 목록도 비움
            setSuggestions([]);
        }
    };
    /** 검색 화면으로 이동 */
    const navigateToMap = useCallback((keyword: string) => {
        if (!keyword) { return; }
        navigation.navigate('SearchResultScreen', { keyword });
        setSearchText('');
    }, [navigation]);

    /** 🔹 맞춤 추천에서 넘어온 initialKeyword 처리 */
    useEffect(() => {
        if (initialKeyword) {
            setSearchText(initialKeyword);
            navigateToMap(initialKeyword);
        }
    }, [initialKeyword, navigateToMap]);


    //최근 검색어 불러오기 
    const fetchRecentSearches = useCallback(async () => {
        try {
            const response = await instance.get('/api/v2/cocktails/search/history');
            if (response.data && response.data.code === 1) {
                setRecentSearches(response.data.data);
            }
        } catch (error) {
            console.log('최근 검색어 로드 실패', error);
            setRecentSearches([]);
        }
    }, []);
    const executeSearch = useCallback(async (keyword: string) => {
        if (!keyword.trim()) return;

        try {
            await instance.post(`/api/v2/cocktails/search/history`, {
                queryText: keyword
            });

            await fetchRecentSearches();

        } catch (error) {
            console.log('검색 기록 저장 실패 (비회원 또는 네트워크 에러)');
        } finally {
            navigateToMap(keyword);
            setSearchText('');
            setSuggestions([]);
        }
    }, [fetchRecentSearches, navigateToMap]);

    //화면 진입시 계속 새로 고침을 하기 위해 FocusEffect를 사용
    useFocusEffect(
        useCallback(() => {
            fetchRecentSearches();
        }, [fetchRecentSearches])
    );
    /** 🔹 검색 submit */
    const handleSubmitSearch = () => {
        executeSearch(searchText);
    };

    /** 🔹 추천 검색어 클릭 */
    const handleSuggestionPress = (keyword: string) => {
        executeSearch(keyword);
    };

    /** 🔹 최근 검색어 클릭 */
    const handleRecentSearchPress = (keyword: string) => {
        executeSearch(keyword);
    };

    /** 🔹 검색어 초기화 */
    const handleClearText = () => {
        setSearchText('');
        setSuggestions([]);
    };

    /** 🔹 뒤로가기 */
    const handleGoBack = () => {
        navigation.goBack();
    };
    //개별 삭제 
    const removeRecentSearch = useCallback(async (id: number) => {
        try {
            const result = await instance.delete(`/api/v2/cocktails/search/history`,
                {
                    data: { id: id }
                }
            )
            console.log('삭제 결과:', result.data);
            await fetchRecentSearches();

        } catch (error: any) {
            console.log('문제가 발생했습니다.', error.data)
        }


    }, [fetchRecentSearches])
    const clearAllRecentSearches = useCallback(async () => {
        try {
            const result = instance.delete(`/api/v2/cocktails/search/history/all`)
            console.log(result);
            await fetchRecentSearches();
        } catch (error: any) {
            console.log('문제가 발생했습니다.', error.data)
        }


    }, [fetchRecentSearches])

    return {
        // state
        searchText,
        suggestions,
        recentNameSearches,
        recentMenuSearches,
        recentSearches,
        removeRecentSearch,
        clearAllRecentSearches,
        handleRecentSearchPress,

        // setter
        setSearchText,

        // handlers
        handleSearchTextChange,
        handleSubmitSearch,
        handleSuggestionPress,
        handleClearText,
        handleGoBack,
        navigateToMap,
    };
};
