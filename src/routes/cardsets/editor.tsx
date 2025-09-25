import { createFileRoute } from "@tanstack/react-router";
import { CardsetEditor } from "@/features/cardset/components/CardsetEditor";

export const Route = createFileRoute("/cardsets/editor")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CardsetEditor />;
}
