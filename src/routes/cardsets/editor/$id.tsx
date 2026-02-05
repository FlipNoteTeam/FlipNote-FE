import { CardsetEditor } from "@/features/cardset/components/CardsetEditor";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cardsets/editor/$id")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "카드셋 편집 | FlipNote" },
      {
        name: "description",
        content: "카드셋의 카드를 편집하고 관리하세요",
      },
    ],
  }),
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <CardsetEditor cardsetId={id} />;
}
