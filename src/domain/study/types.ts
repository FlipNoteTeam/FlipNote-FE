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
  bookmarkedAt: string;
}

export interface CardSetWithLike {
  cardSetId: number;
  name: string;
  likedAt: string;
}
