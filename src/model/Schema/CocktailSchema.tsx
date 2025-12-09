import { z } from "zod";

export const CocktailSchema = z.object({
  id: z.number(),
  korName: z.string(),
  engName: z.string(),
  abvBand: z.string(),
  maxAlcohol: z.number(),
  minAlcohol: z.number(),
  originText: z.string(),
  season: z.string(),
  ingredientsText: z.string(),
  style: z.string(),
  glassType: z.string(),
  base: z.string(),
  imageUrl: z.string().url(),
  flavors: z.array(z.string()),
  moods: z.array(z.string())
});

export type CocktailListItem = z.infer<typeof CocktailSchema>;
