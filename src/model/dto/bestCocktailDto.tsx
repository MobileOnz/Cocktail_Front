import { z } from 'zod';

//  Zod 스키마 정의
export const BestCocktailSchema = z.object({
  id: z.number(),
  image: z.string().url(), // 이미지 URL
  name: z.string(),
});

export type BestCocktailDto = z.infer<typeof BestCocktailSchema>; //타입 추론을 위해 
