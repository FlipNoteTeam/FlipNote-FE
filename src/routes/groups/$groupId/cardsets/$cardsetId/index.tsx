import CardsetDetail from "@/pages/cardset-detail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/groups/$groupId/cardsets/$cardsetId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { groupId, cardsetId } = Route.useParams();

  return (
    <CardsetDetail groupId={Number(groupId)} cardsetId={Number(cardsetId)} />
  );
}
