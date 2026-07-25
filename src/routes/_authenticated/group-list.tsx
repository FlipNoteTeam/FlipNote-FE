import GroupList from "@/pages/group-list";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/group-list")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "그룹 목록 | FlipNote" },
      {
        name: "description",
        content: "관심 있는 학습 그룹을 찾아보세요",
      },
    ],
  }),
});

function RouteComponent() {
  return <GroupList />;
}
