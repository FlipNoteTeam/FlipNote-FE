import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/groups/$groupId/cardsets/$cardsetId/study/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/groups/$groupId/cardsets/$cardsetId/study/"!</div>;
}
