import { createFileRoute } from "@tanstack/react-router";
import { getHomePageContent } from "@/pods/home/home.api";
import { Home } from "@/pods/home";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [content] = await Promise.all([getHomePageContent()]);
    return { content };
  },
  component: App,
});

function App() {
  const { content } = Route.useLoaderData();
  return <Home content={content} />;
}
