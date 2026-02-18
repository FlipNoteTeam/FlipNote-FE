import { Card, CardContent } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Bookmark, Heart, BookOpen } from "lucide-react";
import {
  mockBookmarkedCardSets,
  mockLikedCardSets,
} from "@/shared/mocks/cardsets";
import { ThumbnailCard } from "@/shared/components/thumbnail-card";
import { CardGridSkeleton } from "@/shared/components/skeletons";

export const MyStudyPage = () => {
  // TODO: 실제 API 연동 시 주석 해제
  // const {
  //   data: bookmarkedData,
  //   fetchNextPage: fetchNextBookmarks,
  //   hasNextPage: hasNextBookmarks,
  //   isFetchingNextPage: isFetchingNextBookmarks,
  //   isLoading: isLoadingBookmarks,
  //   error: bookmarksError,
  // } = useMyBookmarkedCardSets();

  // const {
  //   data: likedData,
  //   fetchNextPage: fetchNextLikes,
  //   hasNextPage: hasNextLikes,
  //   isFetchingNextPage: isFetchingNextLikes,
  //   isLoading: isLoadingLikes,
  //   error: likesError,
  // } = useMyLikedCardSets();

  // Mock 데이터 사용 (개발용)
  const bookmarkedCardSets = mockBookmarkedCardSets;
  const likedCardSets = mockLikedCardSets;
  const isLoadingBookmarks = false;
  const isLoadingLikes = false;
  const bookmarksError = null;
  const likesError = null;
  const hasNextBookmarks = false;
  const hasNextLikes = false;

  const renderCardSetGrid = (
    cardSets: typeof bookmarkedCardSets | typeof likedCardSets
  ) => {
    if (cardSets.length === 0) {
      return (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>카드셋이 없습니다.</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardSets.map((cardSet) => (
          <ThumbnailCard
            key={cardSet.cardSetId}
            imageUrl={cardSet.imageUrl}
            title={cardSet.name}
            subtitle={cardSet.hashtag}
            category={cardSet.category}
            className="p-4"
          />
        ))}
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
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="text-red-500">
              카드셋을 불러오는데 실패했습니다.
            </div>
          </div>
        ) : (
          <>
            {renderCardSetGrid(bookmarkedCardSets)}
            {hasNextBookmarks && (
              <div className="flex justify-center pt-4">
                <Button onClick={() => {}} variant="outline">
                  더 보기
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
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="text-red-500">
              카드셋을 불러오는데 실패했습니다.
            </div>
          </div>
        ) : (
          <>
            {renderCardSetGrid(likedCardSets)}
            {hasNextLikes && (
              <div className="flex justify-center pt-4">
                <Button onClick={() => {}} variant="outline">
                  더 보기
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};
