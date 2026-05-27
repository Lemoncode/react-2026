import { createFileRoute } from "@tanstack/react-router";
import { getHomePageContent } from "@/pods/home";

export const Route = createFileRoute("/")({
  loader: async () => {
    const content = await getHomePageContent();
    return { content };
  },
  component: App,
});

function App() {
  const { content } = Route.useLoaderData();
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <h1 className="text-4xl font-bold">{content.headerSection.villaName}</h1>
    </main>
  );
}
