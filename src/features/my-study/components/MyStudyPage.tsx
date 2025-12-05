import { Card, CardContent } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Bookmark, Heart, BookOpen } from "lucide-react";
import {
  mockBookmarkedCardSets,
  mockLikedCardSets,
} from "@/shared/mocks/cardsets";

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
          <Card
            key={cardSet.cardSetId}
            className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          >
            <div className="w-full h-40 bg-gray-100">
              {cardSet.imageUrl ? (
                <img
                  src={cardSet.imageUrl}
                  alt={cardSet.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <BookOpen className="w-12 h-12" />
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                {cardSet.name}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {cardSet.category}
                  </span>
                </div>
                {cardSet.hashtag && (
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {cardSet.hashtag}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
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
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="text-gray-500">로딩 중...</div>
          </div>
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
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="text-gray-500">로딩 중...</div>
          </div>
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
