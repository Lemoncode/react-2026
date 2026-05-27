import { createFileRoute } from "@tanstack/react-router";
import { getHomePageContent } from "@/pods/home/home.api";
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
    const content = await getHomePageContent();
    return { content, currentMonth: getCurrentMonthLabel() };
  },
  component: App,
});

function App() {
  const { content, currentMonth } = Route.useLoaderData();
  return <Home content={content} currentMonth={currentMonth} />;
}
