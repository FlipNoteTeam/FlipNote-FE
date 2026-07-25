import CardSetList from "@/pages/cardset-list";
import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "@/shared/layouts/base-layout";
import { CardGridSkeleton } from "@/shared/components/skeletons";

export const Route = createFileRoute("/_authenticated/cardset-list")({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  head: () => ({
    meta: [
      { title: "카드셋 목록 | FlipNote" },
      {
        name: "description",
        content: "전체 카드셋 목록을 탐색하고 학습을 시작하세요",
      },
    ],
  }),
});

function RouteComponent() {
  return <CardSetList />;
}

function PendingComponent() {
  return (
    <BaseLayout>
      <CardGridSkeleton />
    </BaseLayout>
  );
}
