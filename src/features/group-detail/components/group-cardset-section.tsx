import CardsetCreateDialog from "@/features/cardset/components/cardset-create-dialog";
import { Button } from "@/shared/components/button";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorBoundary } from "@/shared/components/error-boundary";
import ErrorDisplay from "@/shared/components/error-display";
import { ThumbnailCard } from "@/shared/components/thumbnail-card";
import { Link } from "@tanstack/react-router";
import { Plus, Wind } from "lucide-react";

type CardSetItem = {
  id: number;
  name: string;
  groupId: number;
  visibility: "PUBLIC" | "PRIVATE";
  category: string;
  hashtag: string;
  imageRefId: number;
  imageUrl?: string;
  // 수정가능성 높음
  cardCount: number;
  likeCount: number;
  bookmarkCount: number;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  groupId: number;
  cardSets: CardSetItem[];
  hasManagePermission: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
};

export const GroupCardsetSection = ({
  groupId,
  cardSets,
  hasManagePermission,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
}: Props) => {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">카드셋</h2>
        {hasManagePermission && (
          <CardsetCreateDialog
            groupId={groupId}
            renderTrigger={
              <Button size="sm" variant="outline">
                <Plus className="size-4" />
                카드셋 생성
              </Button>
            }
          />
        )}
      </div>

      <ErrorBoundary fallback={<ErrorDisplay />}>
        {cardSets.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cardSets.map((cardSet) => (
                <Link
                  key={cardSet.id}
                  to="/groups/$groupId/cardsets/$cardsetId"
                  params={{
                    groupId: String(groupId),
                    cardsetId: String(cardSet.id),
                  }}
                >
                  <ThumbnailCard
                    imageUrl={cardSet.imageUrl}
                    title={cardSet.name}
                    category={cardSet.category}
                    subtitle={cardSet.hashtag || undefined}
                  />
                </Link>
              ))}
            </div>
            {hasNextPage && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={onFetchNextPage}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? "로딩 중..." : "더 보기"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<Wind />}
            title="카드셋이 없어요"
            description="카드셋을 생성해보세요!"
          />
        )}
      </ErrorBoundary>
    </section>
  );
};
