import { useCallback, useMemo, useState } from 'react';

export type SortType = '최신순' | '인기순';
export type FilterState = {
    sort: SortType;
    degree: string;
    style: string;
    taste: string[];
    base: string[];
};

export const DEFAULT_FILTER: FilterState = {
    sort: '최신순',
    degree: '',
    style: '',
    taste: [],
    base: [],
};

type Params = {
    initialValue?: FilterState;
    onApply?: (value: FilterState) => void;
    onClose?: () => void;
};

export const useFilterBottomSheetViewModel = ({ initialValue, onApply, onClose }: Params) => {

    const init = initialValue ?? DEFAULT_FILTER;

    const [selectedSort, setSelectedSort] = useState<SortType>(init.sort);
    const [selectedDegree, setSelectedDegree] = useState<string>(init.degree);
    const [selectedStyle, setSelectedStyle] = useState<string>(init.style);
    const [selectedTaste, setSelectedTaste] = useState<string[]>(init.taste);
    const [selectedBase, setSelectedBase] = useState<string[]>(init.base);


    const value: FilterState = useMemo(
        () => ({
            sort: selectedSort,
            degree: selectedDegree,
            style: selectedStyle,
            taste: selectedTaste,
            base: selectedBase,
        }),
        [selectedSort, selectedDegree, selectedStyle, selectedTaste, selectedBase]
    );

    const reset = useCallback(() => {
        setSelectedSort(init.sort);
        setSelectedDegree(init.degree);
        setSelectedStyle(init.style);
        setSelectedTaste(init.taste);
        setSelectedBase(init.base);
    }, [init.sort, init.degree, init.style, init.taste, init.base]);

    const apply = useCallback(() => {
        onApply?.(value);
        onClose?.();
    }, [onApply, value, onClose]);

    return {
        selectedSort,
        selectedDegree,
        selectedStyle,
        selectedTaste,
        selectedBase,
        setSelectedSort,
        setSelectedDegree,
        setSelectedStyle,
        setSelectedTaste,
        setSelectedBase,

        reset,
        apply,
        onClose,


        value,
    };
};
