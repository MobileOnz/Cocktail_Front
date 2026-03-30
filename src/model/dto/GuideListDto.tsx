export interface GuideListItemDto {
  part: number;
  title: string;
  imageUrl: string;
}

export interface GuideListResponseDto {
  code: number;
  msg: string;
  data: GuideListItemDto[];
}
