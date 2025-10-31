import { CardsetEditor } from "@/features/cardset/components/CardsetEditor";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cardsets/editor/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <CardsetEditor cardsetId={id} />;
}
