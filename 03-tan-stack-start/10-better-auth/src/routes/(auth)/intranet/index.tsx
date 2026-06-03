import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/intranet/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(auth)/intranet/"!</div>;
}
