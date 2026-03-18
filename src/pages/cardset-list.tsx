import { Suspense, useState, useEffect } from "react";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { ThumbnailCard } from "@/shared/components/thumbnail-card";
import { CardGridSkeleton } from "@/shared/components/skeletons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/select";

import BaseLayout from "@/shared/layouts/base-layout";
import { Link } from "@tanstack/react-router";
import { ArrowDownUp, Search, SearchX } from "lucide-react";
import { useCardSets } from "@/domain/cardsets/hooks/use-card-sets";
import { CardSetFilterSection } from "@/domain/cardsets/components/card-set-filter-section";
import type { CardSetCategory } from "@/domain/cardsets/types";
import type { CardSetSortBy, SortOrder } from "@/shared/apis/card-set";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorBoundary } from "@/shared/components/error-boundary";

const SORT_BY_OPTIONS: { value: CardSetSortBy; label: string }[] = [
  { value: "id", label: "최신순" },
  { value: "like", label: "좋아요순" },
  { value: "book", label: "북마크순" },
];

interface CardSetGridProps {
  keyword?: string;
  category?: CardSetCategory;
  sortBy?: CardSetSortBy;
  order?: SortOrder;
}

const CardSetGrid = ({ keyword, category, sortBy, order }: CardSetGridProps) => {
  const {
    data: cardsetsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCardSets({ keyword, category, size: 20, sortBy, order });

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
              subtitle={cardset.hashtag || undefined}
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
        <EmptyState
          icon={<SearchX className="w-7 h-7" />}
          title="카드셋을 찾지 못했어요"
          description="다른 검색어나 카테고리를 시도해보세요"
        />
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
  const [sortBy, setSortBy] = useState<CardSetSortBy>("id");
  const [order, setOrder] = useState<SortOrder>("desc");

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

  const toggleOrder = () => {
    setOrder((prev) => (prev === "desc" ? "asc" : "desc"));
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

        {/* 필터 및 정렬 영역 */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <CardSetFilterSection
              selectedCategories={selectedCategory ? [selectedCategory] : []}
              onCategoryChange={handleCategoryChange}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as CardSetSortBy)}
            >
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_BY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleOrder}
              className="flex items-center gap-1"
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              {order === "desc" ? "내림차순" : "오름차순"}
            </Button>
          </div>
        </div>

        <ErrorBoundary>
          {/* 카드셋 리스트 - 로딩 중에는 그리드 영역만 스켈레톤으로 대체 */}
          <Suspense fallback={<CardGridSkeleton />}>
            <CardSetGrid
              keyword={searchKeyword || undefined}
              category={selectedCategory}
              sortBy={sortBy}
              order={order}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    </BaseLayout>
  );
};

export default CardSetList;
