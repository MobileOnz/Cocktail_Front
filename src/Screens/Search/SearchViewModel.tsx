// src/viewmodels/SearchViewModel.ts
import { useCallback, useEffect, useState } from 'react';
import { RootStackParamList } from '../../Navigation/Navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { searchKeywords } from '../../model/Repository/KeywordRepository';
import { Keyword } from '../../model/dto/KeywordDto';

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

    const handleSearchTextChange = async (text: string) => {
        console.log('[VM] onChangeText fired:', text);
        setSearchText(text);

        try {
            const list = await searchKeywords(text);
            console.log('[VM] query:', text, 'suggestions:', list.length, list[0]);
            setSuggestions(list);
        } catch (e) {
            console.log('[VM] searchKeywords error:', e);
            setSuggestions([]);
        }
    };

    /** 🔹 검색 submit */
    const handleSubmitSearch = () => {
        if (searchText.length > 0) {
            navigateToMap(searchText);
        }
    };

    /** 🔹 추천 검색어 클릭 */
    const handleSuggestionPress = (keyword: string) => {
        navigateToMap(keyword);
    };

    /** 🔹 최근 검색어 클릭 */
    const handleRecentSearchPress = (keyword: string) => {
        navigateToMap(keyword);
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

    return {
        // state
        searchText,
        suggestions,
        recentNameSearches,
        recentMenuSearches,

        // setter
        setSearchText,

        // handlers
        handleSearchTextChange,
        handleSubmitSearch,
        handleSuggestionPress,
        handleRecentSearchPress,
        handleClearText,
        handleGoBack,
        navigateToMap,
    };
};
