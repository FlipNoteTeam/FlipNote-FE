import { Skeleton } from "@/shared/components/skeleton";
import BaseLayout from "@/shared/layouts/base-layout";

export const GroupDetailSkeleton = () => {
  return (
    <BaseLayout>
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        {/* 그룹 정보 섹션 스켈레톤 */}
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* 멤버 섹션 스켈레톤 */}
        <section className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 space-y-2">
                <Skeleton className="h-24 w-24 rounded-lg" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </section>

        {/* 카드셋 섹션 스켈레톤 */}
        <section className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </BaseLayout>
  );
};
