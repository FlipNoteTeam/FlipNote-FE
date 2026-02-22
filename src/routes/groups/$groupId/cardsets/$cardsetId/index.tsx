import CardsetDetail from "@/pages/cardset-detail";
import { PageSkeleton } from "@/shared/components/skeletons/page-skeleton";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/groups/$groupId/cardsets/$cardsetId/")({
  component: RouteComponent,
  pendingComponent: () => <PageSkeleton />,
});

function RouteComponent() {
  const { groupId, cardsetId } = Route.useParams();

  return (
    <CardsetDetail groupId={Number(groupId)} cardsetId={Number(cardsetId)} />
  );
}
