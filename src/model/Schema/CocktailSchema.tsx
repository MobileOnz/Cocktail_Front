import { z } from 'zod';

// 상세 칵테일 스키마
export const CocktailIngredientSchema = z.object({
  name: z.string(),
  amount: z.string(),
});

export const CocktailSchema = z.object({
  id: z.number(),
  nameKo: z.string(),
  nameEn: z.string(),
  image: z.string().url(),
  styleTag: z.string(),

  summary: z.string(),
  story: z.string(),

  abv: z.string(),
  base: z.string(),
  category: z.string(),
  taste: z.string(),
  body: z.string(),

  ingredients: z.array(CocktailIngredientSchema),

  garnish: z.string(),
  glass: z.string(),
});

export type CocktailSchema = z.infer<typeof CocktailSchema>;
