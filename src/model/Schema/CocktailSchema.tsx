import { z } from 'zod';

export const CocktailSchema = z.object({
  id: z.number(),

  korName: z.string(),
  engName: z.string(),

  abvBand: z.string(),
  minAlcohol: z.number(),
  maxAlcohol: z.number(),

  originText: z.string(),
  season: z.string(),

  ingredients: z.array(z.string()),

  style: z.string(),
  base: z.string(),

  imageUrl: z.string().url(),

  flavors: z.array(z.string()),
  moods: z.array(z.string()),

  glassType: z.string(),
  glassImageUrl: z.string().url(),
  isBookmarked: z.boolean(),

  // Image variants — nullable / optional until S3 image pipeline ships.
  // Both `null` and absent are tolerated; runtime mappers fall back to imageUrl/glassImageUrl.
  imageUrlThumb: z.string().url().optional().nullable(),
  imageUrlDetail: z.string().url().optional().nullable(),
  glassImageUrlThumb: z.string().url().optional().nullable(),
  glassImageUrlDetail: z.string().url().optional().nullable(),
});

export type CocktailListItem = z.infer<typeof CocktailSchema>;

