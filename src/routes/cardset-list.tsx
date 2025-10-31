import CardSetList from "@/pages/cardset-list";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cardset-list")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CardSetList />;
}
