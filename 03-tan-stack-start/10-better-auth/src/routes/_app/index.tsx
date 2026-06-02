import { createFileRoute } from "@tanstack/react-router";
import { getHomePageContent } from "@/pods/home/home.api";
import { getAvailabilityByMonth } from "@/pods/home/availability.api";
import { Home } from "@/pods/home";

export const Route = createFileRoute("/_app/")({
  loader: async () => {
    const now = new Date();
    const [content, availability] = await Promise.all([
      getHomePageContent(),
      getAvailabilityByMonth({
        data: {
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          monthsAhead: 1,
        },
      }),
    ]);
    return { content, availability };
  },
  component: App,
});

function App() {
  const { content, availability } = Route.useLoaderData();
  return <Home content={content} availability={availability} />;
}
