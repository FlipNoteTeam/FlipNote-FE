import CreateGroup from "@/pages/create-group";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/groups/create")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "그룹 생성 | FlipNote" },
      {
        name: "description",
        content: "새로운 학습 그룹을 만들어보세요",
      },
    ],
  }),
});

function RouteComponent() {
  return <CreateGroup />;
}
