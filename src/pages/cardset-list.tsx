import { useState, useEffect } from "react";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { ThumbnailCard } from "@/shared/components/thumbnail-card";

import BaseLayout from "@/shared/layouts/base-layout";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useCardSets } from "@/domain/cardsets/hooks/use-card-sets";
import { CardSetFilterSection } from "@/domain/cardsets/components/card-set-filter-section";
import type { CardSetCategory } from "@/domain/cardsets/types";
import { CardGridSkeleton } from "@/shared/components/skeletons";

const CardSetList = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    CardSetCategory | undefined
  >(undefined);

  // Debounce 검색어 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // API에서 카드셋 데이터 가져오기
  const {
    data: cardsetsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    // error,
  } = useCardSets({
    keyword: searchKeyword || undefined,
    category: selectedCategory,
    size: 20,
  });

  // 카테고리 체크박스 핸들러
  const handleCategoryChange = (
    category: CardSetCategory,
    checked: boolean
  ) => {
    setSelectedCategory(checked ? category : undefined);
  };

  // // 정렬 필드 핸들러
  // const handleSortByChange = (value: string) => {
  //   setSortBy(value);
  // };

  // // 정렬 순서 핸들러
  // const handleOrderChange = (value: string) => {
  //   setOrder(value as "ASC" | "DESC");
  // };

  // if (isLoading) {
  //   return (
  //     <BaseLayout>
  //       <div className="flex justify-center items-center min-h-[400px]">
  //         <div className="text-gray-500">로딩 중...</div>
  //       </div>
  //     </BaseLayout>
  //   );
  // }

  // if (error) {
  //   return (
  //     <BaseLayout>
  //       <div className="flex justify-center items-center min-h-[400px]">
  //         <div className="text-red-500">데이터를 불러오는데 실패했습니다.</div>
  //       </div>
  //     </BaseLayout>
  //   );
  // }

  return (
    <BaseLayout>
      <div className="space-y-6">
        {/* 검색 및 헤더 영역 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              플래시카드셋 목록
            </h1>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="플래시카드셋을 검색해보세요"
              className="pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {/* 필터 및 정렬 영역 */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <CardSetFilterSection
              selectedCategories={selectedCategory ? [selectedCategory] : []}
              onCategoryChange={handleCategoryChange}
            />
          </div>
          {/* 
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>정렬:</span>
            <Select value={sortBy} onValueChange={handleSortByChange}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">생성일</SelectItem>
                <SelectItem value="name">이름</SelectItem>
                <SelectItem value="modifiedAt">수정일</SelectItem>
              </SelectContent>
            </Select>
            <Select value={order} onValueChange={handleOrderChange}>
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DESC">내림차순↓</SelectItem>
                <SelectItem value="ASC">오름차순↑</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        </div>

        {/* 카드셋 리스트 */}
        {isLoading ? (
          <CardGridSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cardsetsData?.cardsets.map((cardset) => (
              <Link
                to="/groups/$groupId/cardsets/$cardsetId"
                params={{
                  groupId: cardset.groupId.toString(),
                  cardsetId: cardset.cardSetId.toString(),
                }}
                key={cardset.cardSetId}
              >
                <ThumbnailCard
                  imageUrl={cardset.imageUrl}
                  title={cardset.name}
                  category={cardset.category}
                  subtitle={
                    cardset.hashtag
                      ? `${cardset.hashtag
                          .split(",")
                          .map((tag) => `#${tag}`)
                          .join(" ")}`
                      : undefined
                  }
                />
              </Link>
            ))}
          </div>
        )}

        {/* 더 보기 버튼 */}
        {hasNextPage && (
          <div className="flex justify-center">
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              variant="outline"
            >
              {isFetchingNextPage ? "로딩 중..." : "더 보기"}
            </Button>
          </div>
        )}

        {/* 결과 없음 */}
        {(!cardsetsData?.cardsets || cardsetsData.cardsets.length === 0) &&
          !isLoading && (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="text-gray-500">
                검색 조건에 맞는 카드셋이 없습니다.
              </div>
            </div>
          )}
      </div>
    </BaseLayout>
  );
};

export default CardSetList;
