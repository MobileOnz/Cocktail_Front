import { useMemo, useState } from "react";
import { CocktailGuideRepository } from "../../model/Repository/CocktailGuideRepository";
import { CocktailGuideDataSource } from "../../model/DataSource/CocktailGuideDataSource";
import { GuideSummary } from "../../model/domain/GuideSummary";
import { Guide } from "../../model/domain/GuideDetail";
import { stay3sViewGuidedetail, viewPageGuidedetail } from "../../analytics/eventProperty";

const GuideDetailViewModel = () => {
    const repository = useMemo(
        () =>
        new CocktailGuideRepository(
            new CocktailGuideDataSource()
        ),
        []
    );

    const [guideList, setGuideList] = useState<GuideSummary[]>([]);
    const [guideDetail, setGuideDetail] = useState<Guide | null>(null);
    const [loading, setLoading] = useState(false);

    const getGuideList = async () => {
        try {
            setLoading(true);
            const list = await repository.guideList()
            setGuideList(list);

        } catch (e) {
            console.log('가이드 목록 조회 실패', e);
        } finally {
            setLoading(false);
        }
    }

    const getGuideDetail = async(part: number) => {
        try {
            setLoading(true);
            const guideDetail = await repository.guideDetail(part)
            setGuideDetail(guideDetail);
            viewPageGuideDetail(guideDetail)
        } catch (e) {
            console.log('상세 가이드 조회 실패', e);
        } finally {
            setLoading(false);
        }
    }

    const viewPageGuideDetail = (guide: Guide) => {
        viewPageGuidedetail({
            guideId: guide?.part!,
            guideTitle: guide?.title!,
            guideType: `part${getPart(guide?.part!)}`,
            entryOrigin: "guide_home"
        })
    }

    const stay3sViewGuideDetail = (guide: Guide) => {
        console.log("stay3sViewGuideDetail 실행", guide)
        stay3sViewGuidedetail({
            guideId: guide?.part!,
            guideTitle: guide?.title!,
            guideType: `part${getPart(guide?.part!)}`,
            entryOrigin: "guide_home"
        })
    }

    const getPart = (value: number) => {
        return Math.floor(value / 100);
    };

    return {
        guideList, getGuideList, loading, getGuideDetail, guideDetail, stay3sViewGuideDetail
    }
}

export default GuideDetailViewModel;