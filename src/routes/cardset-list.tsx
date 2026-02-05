import CardSetList from "@/pages/cardset-list";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cardset-list")({
  component: RouteComponent,
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
