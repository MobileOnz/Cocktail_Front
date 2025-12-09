import { StyleSheet } from 'react-native'
import { useEffect, useMemo, useState } from 'react'
import { CocktailCard } from '../../model/domain/CocktailCard'
import { CocktailSearchRepository } from '../../model/repository/SearchRepository';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const useSearchResultViewModel = (keyword: string) => {
    const [results, setResults] = useState<CocktailCard[]>([]);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    // const navigation = useNavigation()

    const repository = useMemo(() => new CocktailSearchRepository(), [])


    const fetchResult = async () => {
        if (!keyword.trim) return;
        setLoading(true)
        setError(null)

        try {
            const data = await repository.search(keyword.trim())
            setResults(data)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(" AxiosError message:", error.message);
                console.log(" AxiosError code:", error.code);
                console.log(" AxiosError config:", error.config);
                console.log(" AxiosError request:", error.request);
                console.log(" AxiosError response:", error.response?.data);
                console.log(" AxiosError status:", error.response?.status);
            } else {
                console.log(" Unknown error:", error);
            }
        }
        finally {
            setLoading(false)
        }

    }

    useEffect(() => {
        fetchResult()
    }, [keyword])

    return {
        results,
        loading,
        error,
        refetch: fetchResult
    }

}

export default useSearchResultViewModel