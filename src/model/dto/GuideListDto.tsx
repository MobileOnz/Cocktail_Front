export interface GuideListItemDto {
  part: number;
  title: string;
  imageUrl: string;
  category?: string | null;
}

export interface GuideListResponseDto {
  code: number;
  msg: string;
  data: GuideListItemDto[];
}
