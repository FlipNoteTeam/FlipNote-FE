import { Button } from "@/shared/components/button";
import { Bookmark, Heart, BookOpen, ChevronRight } from "lucide-react";
import { CardSetListSkeleton } from "@/shared/components/skeletons";
import { useMyBookmarkedCardSets } from "@/domain/study/hooks/use-my-bookmarked-card-sets";
import { useMyLikedCardSets } from "@/domain/study/hooks/use-my-liked-card-sets";
import type { CardSetWithBookmark, CardSetWithLike } from "@/domain/study/types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import ErrorDisplay from "@/shared/components/error-display";
import { EmptyState } from "@/shared/components/empty-state";
import { Link } from "@tanstack/react-router";

type CardSetItem = CardSetWithBookmark | CardSetWithLike;

const CardSetListItem = ({
  cardSet,
  timestamp,
}: {
  cardSet: CardSetItem;
  timestamp: string;
}) => (
  <Link
    to="/groups/$groupId/cardsets/$cardsetId"
    params={{
      groupId: String(cardSet.groupId),
      cardsetId: String(cardSet.cardSetId),
    }}
    className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-muted transition-colors group"
  >
    <div className="flex items-center gap-3 min-w-0">
      <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
        {cardSet.name}
      </span>
    </div>
    <div className="flex items-center gap-2 shrink-0 ml-3">
      <span className="text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(timestamp), {
          addSuffix: true,
          locale: ko,
        })}
      </span>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </div>
  </Link>
);

const renderCardSetList = (
  cardSets: CardSetItem[],
  timestampKey: "bookmarkedAt" | "likedAt"
) => {
  if (cardSets.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="w-8 h-8" />}
        title="카드셋이 없습니다"
      />
    );
  }

  return (
    <div className="divide-y divide-border rounded-lg border">
      {cardSets.map((cardSet) => {
        const timestamp = (cardSet as unknown as Record<string, string>)[timestampKey];
        return (
          <CardSetListItem
            key={cardSet.cardSetId}
            cardSet={cardSet}
            timestamp={timestamp}
          />
        );
      })}
    </div>
  );
};

export const MyStudyPage = () => {
  const {
    data: bookmarkedData,
    fetchNextPage: fetchNextBookmarks,
    hasNextPage: hasNextBookmarks,
    isFetchingNextPage: isFetchingNextBookmarks,
    isLoading: isLoadingBookmarks,
    error: bookmarksError,
    refetch: refetchBookmarks,
  } = useMyBookmarkedCardSets();

  const {
    data: likedData,
    fetchNextPage: fetchNextLikes,
    hasNextPage: hasNextLikes,
    isFetchingNextPage: isFetchingNextLikes,
    isLoading: isLoadingLikes,
    error: likesError,
    refetch: refetchLikes,
  } = useMyLikedCardSets();

  const bookmarkedCardSets = bookmarkedData?.bookmarks ?? [];
  const likedCardSets = likedData?.likes ?? [];

  return (
    <div className="space-y-10">
      {/* 즐겨찾기 섹션 */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">즐겨찾기 카드셋</h2>
        </div>

        {isLoadingBookmarks ? (
          <CardSetListSkeleton />
        ) : bookmarksError ? (
          <ErrorDisplay onRetry={() => refetchBookmarks()} />
        ) : (
          <>
            {renderCardSetList(bookmarkedCardSets, "bookmarkedAt")}
            {hasNextBookmarks && (
              <div className="flex justify-center pt-2">
                <Button
                  onClick={() => fetchNextBookmarks()}
                  disabled={isFetchingNextBookmarks}
                  variant="ghost"
                  size="sm"
                >
                  {isFetchingNextBookmarks ? "로딩 중..." : "더 보기"}
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* 좋아요 섹션 */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900">좋아요한 카드셋</h2>
        </div>

        {isLoadingLikes ? (
          <CardSetListSkeleton />
        ) : likesError ? (
          <ErrorDisplay onRetry={() => refetchLikes()} />
        ) : (
          <>
            {renderCardSetList(likedCardSets, "likedAt")}
            {hasNextLikes && (
              <div className="flex justify-center pt-2">
                <Button
                  onClick={() => fetchNextLikes()}
                  disabled={isFetchingNextLikes}
                  variant="ghost"
                  size="sm"
                >
                  {isFetchingNextLikes ? "로딩 중..." : "더 보기"}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};
