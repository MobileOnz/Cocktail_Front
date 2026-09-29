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

  // 사진이 없는 칵테일이 있다. 배경이 어수선하거나 잔이 여러 개 들어간 사진을
  // 내리면서 image_url 을 NULL 로 둔 것들이다(대체본이 아직 없다).
  // 여기서 필수로 두면 Zod 가 던지고 상세 화면이 통째로 '에러가 발생했습니다' 가 된다 —
  // 사진 한 장 없다고 레시피까지 못 보게 할 이유가 없다.
  // RemoteImage 와 상세 히어로는 uri 가 비면 '이미지 준비중' 자리를 그린다.
  imageUrl: z.string().url().nullable(),

  flavors: z.array(z.string()),
  moods: z.array(z.string()),

  glassType: z.string(),
  glassImageUrl: z.string().url().nullable(),
  isBookmarked: z.boolean(),

  // Image variants — nullable / optional until S3 image pipeline ships.
  // Both `null` and absent are tolerated; runtime mappers fall back to imageUrl/glassImageUrl.
  imageUrlThumb: z.string().url().optional().nullable(),
  imageUrlDetail: z.string().url().optional().nullable(),
  glassImageUrlThumb: z.string().url().optional().nullable(),
  glassImageUrlDetail: z.string().url().optional().nullable(),
});

export type CocktailListItem = z.infer<typeof CocktailSchema>;

