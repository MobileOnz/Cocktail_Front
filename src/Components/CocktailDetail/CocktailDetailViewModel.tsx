import { useCallback, useEffect, useState } from "react";
import { ICocktailDetailRepository } from "../../model/repository/CocktailDetailRepository";
import { CocktailDetail } from "../../model/domain/CocktailDetail";
import { di } from "../../DI/Container";


type UseCocktailDetailDeps = {
    repository?: ICocktailDetailRepository;
};

const useCocktailDetailViewModel = (id: number, deps?: UseCocktailDetailDeps) => {
    const [detail, setDetail] = useState<CocktailDetail>();
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const repository = deps?.repository ?? di.cocktailDetailRepository;


    const fetchDetail = useCallback(async () => {

        try {
            const data = await repository.getDetailData(id)
            setDetail(data)
        } catch (error) {
            console.log(error);
            setError("에러가 발생했습니다")
        }
        finally {
            setLoading(false)
        }

    }, [id, repository])

    useEffect(() => {
        fetchDetail()
    }, [fetchDetail])

    return {
        detail,
        loading,
        error,
    }

}
export default useCocktailDetailViewModel
