import CardsetDetailSheet from "@/features/group-detail/components/cardset-detail-sheet";
import { PageSkeleton } from "@/shared/components/skeletons/page-skeleton";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/groups/$groupId/cardsets/$cardsetId/")({
  component: RouteComponent,
  pendingComponent: () => <PageSkeleton />,
});

function RouteComponent() {
  const { groupId, cardsetId } = Route.useParams();

  return (
    <CardsetDetailSheet
      groupId={Number(groupId)}
      cardsetId={Number(cardsetId)}
    />
  );
}
