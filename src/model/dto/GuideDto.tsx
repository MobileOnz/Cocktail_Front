export interface GuideDetailDto {
  displayOrder: number;
  subtitle: string;
  description: string;
  imageUrl: string;
}

export interface GuideDto {
  part: number;
  title: string;
  imageUrl: string;
  details: GuideDetailDto[];
}

export interface GuideResponseDto {
  code: number;
  msg: string;
  data: GuideDto;
}
