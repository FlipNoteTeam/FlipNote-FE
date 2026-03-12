import { Card, CardContent } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Bookmark, Heart, BookOpen } from "lucide-react";
import { CardGridSkeleton } from "@/shared/components/skeletons";
import { useMyBookmarkedCardSets } from "@/domain/study/hooks/use-my-bookmarked-card-sets";
import { useMyLikedCardSets } from "@/domain/study/hooks/use-my-liked-card-sets";
import type { CardSetWithBookmark, CardSetWithLike } from "@/domain/study/types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import ErrorDisplay from "@/shared/components/error-display";
import { EmptyState } from "@/shared/components/empty-state";

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

  const renderCardSetGrid = (
    cardSets: CardSetWithBookmark[] | CardSetWithLike[],
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cardSets.map((cardSet) => {
          const timestamp = (cardSet as unknown as Record<string, string>)[timestampKey];
          return (
            <Card
              key={cardSet.cardSetId}
              className="hover:shadow-md transition-shadow cursor-default"
            >
              <CardContent className="p-4 flex flex-col gap-2">
                <p className="font-medium text-gray-900 line-clamp-2 leading-snug">
                  {cardSet.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(timestamp), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {/* 즐겨찾기 섹션 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-gray-900">
            즐겨찾기 카드셋
          </h2>
        </div>

        {isLoadingBookmarks ? (
          <CardGridSkeleton />
        ) : bookmarksError ? (
          <ErrorDisplay onRetry={() => refetchBookmarks()} />
        ) : (
          <>
            {renderCardSetGrid(bookmarkedCardSets, "bookmarkedAt")}
            {hasNextBookmarks && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => fetchNextBookmarks()}
                  disabled={isFetchingNextBookmarks}
                  variant="outline"
                >
                  {isFetchingNextBookmarks ? "로딩 중..." : "더 보기"}
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* 좋아요 섹션 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-semibold text-gray-900">
            좋아요한 카드셋
          </h2>
        </div>

        {isLoadingLikes ? (
          <CardGridSkeleton />
        ) : likesError ? (
          <ErrorDisplay onRetry={() => refetchLikes()} />
        ) : (
          <>
            {renderCardSetGrid(likedCardSets, "likedAt")}
            {hasNextLikes && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => fetchNextLikes()}
                  disabled={isFetchingNextLikes}
                  variant="outline"
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
