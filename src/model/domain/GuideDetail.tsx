export interface GuideDetail {
  order: number;
  subtitle: string;
  description: string;
  imageUrl: string;
}

export interface Guide {
  part: number;
  title: string;
  imageUrl: string;
  details: GuideDetail[];
}
