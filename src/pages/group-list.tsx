import { useState, useEffect } from "react";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { ThumbnailCard } from "@/shared/components/thumbnail-card";

import BaseLayout from "@/shared/layouts/base-layout";
import { Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useGroups } from "@/features/group-search/hooks/use-groups";
import { GroupFilterSection } from "@/features/group-search/components/group-filter-section";
import type { GroupCategory } from "@/shared/apis/types";
import CreateGroupDialog from "@/features/create-group/components/create-group-dialog";
import { CardGridSkeleton } from "@/shared/components/skeletons";

interface GroupGridProps {
  keyword?: string;
  category?: GroupCategory;
}

const GroupGrid = ({ keyword, category }: GroupGridProps) => {
  const {
    data: groupsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useGroups({ keyword, category, size: 20 });

  if (isLoading) {
    return <CardGridSkeleton />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-red-500">데이터를 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {groupsData?.groups.map((group) => (
          <Link
            to="/groups/$groupId"
            params={{ groupId: group.groupId.toString() }}
            key={group.groupId}
          >
            <ThumbnailCard
              imageUrl={group.imageUrl}
              title={group.name}
              category={group.category}
              subtitle={group.description}
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

      {(!groupsData?.groups || groupsData.groups.length === 0) && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-gray-500">
            검색 조건에 맞는 그룹이 없습니다.
          </div>
        </div>
      )}
    </>
  );
};

const GroupList = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    GroupCategory | undefined
  >(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchInput);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleCategoryChange = (category: GroupCategory, checked: boolean) => {
    setSelectedCategory(checked ? category : undefined);
  };

  return (
    <BaseLayout>
      <div className="space-y-6">
        {/* 검색 및 헤더 영역 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">그룹 목록</h1>
            <CreateGroupDialog
              renderTrigger={
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  그룹 생성
                </Button>
              }
            />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="스터디 그룹을 검색해보세요"
              className="pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {/* 필터 영역 */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <GroupFilterSection
              selectedCategories={selectedCategory ? [selectedCategory] : []}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>

        {/* 그룹 리스트 - 로딩 중에는 그리드 영역만 스켈레톤으로 대체 */}
        <GroupGrid
          keyword={searchKeyword || undefined}
          category={selectedCategory}
        />
      </div>
    </BaseLayout>
  );
};

export default GroupList;
