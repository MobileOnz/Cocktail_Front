// src/viewmodels/SearchViewModel.ts
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import instance from '../../tokenRequest/axios_interceptor';
import { RootStackParamList } from '../../Navigation/Navigation';
import { StackNavigationProp } from '@react-navigation/stack';

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
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [recentNameSearches, setRecentNameSearches] = useState<SearchLog[]>([]);
    const [recentMenuSearches, setRecentMenuSearches] = useState<SearchLog[]>([]);

    /** 공통: 지도 화면으로 이동 */
    const navigateToMap = useCallback((keyword: string) => {
        if (!keyword) { return; }
        navigation.navigate('BottomTabNavigator', {
            screen: '지도',
            params: {
                searchCompleted: true,
                searchQuery: keyword,
            } as any,
        });
    }, [navigation]);

    /** 🔹 맞춤 추천에서 넘어온 initialKeyword 처리 */
    useEffect(() => {
        if (initialKeyword) {
            setSearchText(initialKeyword);
            navigateToMap(initialKeyword);
        }
    }, [initialKeyword, navigateToMap]);

    /** 🔹 최근 검색어 불러오기 */
    useEffect(() => {
        const fetchRecentSearches = async () => {
            try {
                const accessToken = await AsyncStorage.getItem('accessToken');
                console.log('🔥 accessToken from AsyncStorage:', accessToken);

                if (!accessToken) {
                    console.log('로그인 안된 사용자 - 토큰 없음');
                    return;
                }

                const res = await instance.get('/api/search/searchlog', {
                    authRequired: true,
                } as any);

                const result = res.data;
                console.log('📥 최근 검색어 요청 결과:', result);

                if (result.code === 1) {
                    setRecentNameSearches(result.data.name || []);
                    setRecentMenuSearches(result.data.menu || []);
                } else {
                    console.log('🔒 로그인 안 된 사용자 - 서버에서 비정상 처리됨');
                }
            } catch (err) {
                console.error('❌ 최근 검색어 불러오기 실패:', err);
            }
        };

        fetchRecentSearches();
    }, []);

    /** 🔹 추천 검색어 fetch */
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchText.length === 0) {
                setSuggestions([]);
                return;
            }

            try {
                const res = await instance.get('/api/search/suggestions', {
                    params: { query: searchText },
                    authOptional: true,
                } as any);

                const result = res.data;
                if (result.code === 1 && Array.isArray(result.data)) {
                    setSuggestions(result.data);
                } else {
                    setSuggestions([]);
                }
            } catch (err) {
                console.error('❌ 추천 검색어 불러오기 실패:', err);
                setSuggestions([]);
            }
        };

        fetchSuggestions();
    }, [searchText]);

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
        handleSubmitSearch,
        handleSuggestionPress,
        handleRecentSearchPress,
        handleClearText,
        handleGoBack,
    };
};
