import { getUserSession } from "#/core/user-session";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/intranet")({
  loader: () => getUserSession(),
  component: RouteComponent,
});

function RouteComponent() {
  const session = Route.useLoaderData();
  return (
    <div>
      <h1>Intranet - Welcome {session.user.name}</h1>
      <Outlet />
    </div>
  );
}
