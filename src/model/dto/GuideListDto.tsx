// 가이드 목록은 매거진 GUIDE 카테고리에서 온다: GET /api/v2/magazine?category=GUIDE
// 응답 봉투는 뉴스와 동일({items, nextCursor}). item 은 매거진 카드.
export interface MagazineGuideItemDto {
  id: number;            // = 기존 guide.part (V12 에서 보존)
  title: string;
  imageUrl: string | null;
  categoryLabel: string | null; // = 기존 guide.category (입문/만들기/실전)
}

export interface GuideListResponseDto {
  code: number;
  msg: string;
  data: {
    items: MagazineGuideItemDto[];
    nextCursor: string | null;
  };
}
