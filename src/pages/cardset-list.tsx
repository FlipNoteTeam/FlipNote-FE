import { Suspense, useState, useEffect } from "react";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { ThumbnailCard } from "@/shared/components/thumbnail-card";
import { CardGridSkeleton } from "@/shared/components/skeletons";

import BaseLayout from "@/shared/layouts/base-layout";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useCardSets } from "@/domain/cardsets/hooks/use-card-sets";
import { CardSetFilterSection } from "@/domain/cardsets/components/card-set-filter-section";
import type { CardSetCategory } from "@/domain/cardsets/types";

interface CardSetGridProps {
  keyword?: string;
  category?: CardSetCategory;
}

const CardSetGrid = ({ keyword, category }: CardSetGridProps) => {
  const {
    data: cardsetsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCardSets({ keyword, category, size: 20 });

  return (
    <>
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

      {(!cardsetsData?.cardsets || cardsetsData.cardsets.length === 0) && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-gray-500">
            검색 조건에 맞는 카드셋이 없습니다.
          </div>
        </div>
      )}
    </>
  );
};

const CardSetList = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    CardSetCategory | undefined
  >(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchInput);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleCategoryChange = (
    category: CardSetCategory,
    checked: boolean,
  ) => {
    setSelectedCategory(checked ? category : undefined);
  };

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

        {/* 필터 영역 */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <CardSetFilterSection
              selectedCategories={selectedCategory ? [selectedCategory] : []}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>

        {/* 카드셋 리스트 - 로딩 중에는 그리드 영역만 스켈레톤으로 대체 */}
        <Suspense fallback={<CardGridSkeleton />}>
          <CardSetGrid
            keyword={searchKeyword || undefined}
            category={selectedCategory}
          />
        </Suspense>
      </div>
    </BaseLayout>
  );
};

export default CardSetList;
