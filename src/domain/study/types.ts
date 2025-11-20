export type {
  BookmarkResponseBookmarkTargetResponse,
  BookmarkSearchRequest,
} from "@/shared/apis/bookmark";

export type {
  LikeResponseLikeTargetResponse,
  LikeSearchRequest,
} from "@/shared/apis/like";

export interface CardSetWithBookmark {
  cardSetId: number;
  name: string;
  category: string;
  hashtag: string;
  imageUrl?: string;
  bookmarkedAt: string;
}

export interface CardSetWithLike {
  cardSetId: number;
  name: string;
  category: string;
  hashtag: string;
  imageUrl?: string;
  likedAt: string;
}
