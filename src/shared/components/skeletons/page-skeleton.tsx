import { Skeleton } from "@/shared/components/skeleton";
import BaseLayout from "@/shared/layouts/base-layout";

export const PageSkeleton = () => {
  return (
    <BaseLayout>
      <div className="flex justify-center items-center min-h-screen">
        <div className="space-y-4 w-full max-w-2xl px-6">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};
