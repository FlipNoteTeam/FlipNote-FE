import { Skeleton } from "@/shared/components/skeleton";

export const CardSetListSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="divide-y divide-border rounded-lg border">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Skeleton className="h-4 w-4 shrink-0 rounded" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};
