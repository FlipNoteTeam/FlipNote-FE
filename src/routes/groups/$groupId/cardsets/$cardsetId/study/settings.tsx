import StudySettings from "@/features/setting-study-mode/ui/study-settings";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/groups/$groupId/cardsets/$cardsetId/study/settings"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { groupId, cardsetId } = Route.useParams();

  return (
    <StudySettings groupId={Number(groupId)} cardsetId={Number(cardsetId)} />
  );
}
