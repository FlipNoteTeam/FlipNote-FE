import { Skeleton } from "@/shared/components/skeleton";
import { Card, CardContent } from "@/shared/components/card";

export const ProfileCardSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="space-y-2 w-full max-w-md">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
