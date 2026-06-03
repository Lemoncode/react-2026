import { getUserSession } from "#/core/user-session";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import IntranetHeader from "@/components/IntranetHeader";

export const Route = createFileRoute("/(auth)/intranet")({
  loader: () => getUserSession(),
  component: RouteComponent,
});

function RouteComponent() {
  const session = Route.useLoaderData();
  return (
    <div>
      <IntranetHeader userName={session.user.name} />
      <main className="page-wrap py-6">
        <Outlet />
      </main>
    </div>
  );
}
