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
  groupId: number;
  name: string;
  bookmarkedAt: string;
}

export interface CardSetWithLike {
  cardSetId: number;
  groupId: number;
  name: string;
  likedAt: string;
}
