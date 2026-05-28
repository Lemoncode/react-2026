import { createFileRoute } from "@tanstack/react-router";
import { getHomePageContent } from "@/pods/home/home.api";
import { getAvailabilityByMonth } from "@/pods/home/availability.api";
import { Home } from "@/pods/home";

const getCurrentMonthLabel = (): string => {
  const label = new Date().toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const Route = createFileRoute("/")({
  loader: async () => {
    const now = new Date();
    const [content, availability] = await Promise.all([
      getHomePageContent(),
      getAvailabilityByMonth({
        data: { month: now.getMonth() + 1, year: now.getFullYear() },
      }),
    ]);
    console.log("[home loader] availability", availability);
    return { content, currentMonth: getCurrentMonthLabel() };
  },
  component: App,
});

function App() {
  const { content, currentMonth } = Route.useLoaderData();
  return <Home content={content} currentMonth={currentMonth} />;
}
