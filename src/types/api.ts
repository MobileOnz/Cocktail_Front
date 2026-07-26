/**
 * 백엔드 응답 타입 (T-21).
 *
 * 전부 로컬 백엔드(http://localhost:18080/onz)의 **실제 응답을 curl 로 확인**해 작성했다.
 * 계획서 §4.1 의 초안 계약과 다른 부분이 있으며, 여기서는 **실물**을 따른다.
 *   - NewsCard 에 author / thumbUrl / readMinutes 는 없다 → source / viewCount 가 실재
 *   - CocktailStep 에 id 는 없다 → stepOrder 가 사실상 키
 *   - FeedItem 의 type 은 'news' | 'guide' 뿐 ('cocktail' 없음)
 *   - FeedItem 은 @JsonInclude(NON_NULL) 이라 null 필드가 **키째로 빠진다** → 전부 optional
 */

export type NewsCategoryCode =
  | 'BEGINNER'
  | 'EXPERT'
  | 'TREND'
  | 'WHISKY'
  | 'CARTOON';

/** GET /api/v2/news → data.items[] , GET /api/v2/news/featured → data[] */
export interface NewsCard {
  id: number;
  title: string;
  summary: string | null;
  category: NewsCategoryCode | string;
  /** 서버가 내려주는 한국어 라벨. 프론트에서 매핑하지 말 것. */
  categoryLabel: string;
  imageUrl: string | null;
  source: string | null;
  sourceUrl: string | null;
  /** ISO-8601 LocalDateTime, 타임존 없음. 예: "2026-06-25T16:43:51.297446" */
  publishedAt: string;
  viewCount: number;
}

/** GET /api/v2/news/{id} → data */
export interface NewsDetail extends NewsCard {
  content: string | null;
}

/** GET /api/v2/news → data */
export interface NewsFeedResponse {
  items: NewsCard[];
  /** 다음 페이지 커서. 없으면 null. 문자열이다(숫자 아님). */
  nextCursor: string | null;
}

/* ── 매거진(블록형 콘텐츠) ──
 * 목록 GET /api/v2/magazine 은 NewsFeedResponse 와 동일 형태({items,nextCursor}),
 * items 는 NewsCard 와 필드 호환(imageUrl/categoryLabel/source). 목록은 별도 타입 불필요.
 * 상세 GET /api/v2/magazine/{id} 만 아래 블록 구조로 온다.
 * content/refs/titleLines 는 서버가 원본 JSON(@JsonRawValue)으로 방출 → axios 가 실제 배열/객체로 파싱한다.
 * 블록 내부 키는 snake_case(name_en, cocktail_id) 유지. */
export interface MagazineMark {
  text: string;
  style: 'bold' | string;
}
export interface CocktailSpecRow {
  k: string;
  v: string;
}
export type MagazineBlock =
  | { type: 'paragraph'; text: string; marks?: MagazineMark[] }
  | { type: 'heading'; level?: number; text: string }
  | { type: 'quote'; text: string; cite?: string }
  | {
      type: 'cocktail_spec';
      name?: string;
      name_en?: string;
      image?: string;
      cocktail_id?: number | null;
      specs?: CocktailSpecRow[];
    }
  // 미지원 타입은 렌더러가 스킵한다.
  | { type: string; [key: string]: unknown };

export interface MagazineSource {
  title: string;
  url: string;
}
export interface MagazineRefs {
  sources?: MagazineSource[];
  related_article_slugs?: string[];
  cocktail_ids?: number[];
}

/** GET /api/v2/magazine/{id} → data */
export interface MagazineDetail {
  id: number;
  slug: string;
  title: string;
  titleLines: string[] | null;
  dek: string | null;
  category: string;
  subcategory: string | null;
  heroImage: string | null;
  coverImage: string | null;
  thumbnail: string | null;
  imageCaption: string | null;
  authorName: string | null;
  content: MagazineBlock[];
  refs: MagazineRefs | null;
  readingTimeMin: number | null;
  viewCount: number;
  /** ISO-8601 LocalDateTime, 타임존 없음. */
  publishedAt: string;
  tags: string[];
}

/** GET /api/v2/cocktails/{id}/steps → data[] */
export interface CocktailStep {
  stepOrder: number;
  instruction: string;
  imageUrl: string | null;
  durationSec: number | null;
  tip: string | null;
  toolIds: number[];
}

/** GET /api/v2/main → data.hero (nullable) */
export interface Hero {
  cocktailId: number;
  name: string;
  imageUrl: string | null;
  heroReason: string;
}

/**
 * GET /api/v2/main → data.feed[]
 * 판별 유니온. NON_NULL 직렬화라 해당 타입에 없는 키는 아예 존재하지 않는다.
 */
export type FeedItem =
  | {
      type: 'news';
      id: number;
      title: string;
      summary?: string | null;
      category?: string;
      categoryLabel?: string;
      imageUrl?: string | null;
      publishedAt?: string;
    }
  | {
      type: 'guide';
      part: number;
      title: string;
      imageUrl?: string | null;
    };

/** GET /api/v2/main → data */
export interface MainResponse {
  hero: Hero | null;
  feed: FeedItem[];
  nextCursor: string | null;
}
