import { createServerFn } from "@tanstack/react-start";
import { contentIslandClient } from "@/lib/content-island";
import type { FullMainPageVm } from "./home.vm";
import { mapFullMainPageToVm } from "./home.mapper";

export const getHomePageContent = createServerFn({ method: "GET" }).handler(
  async () => {
    const content = await contentIslandClient.getContent<FullMainPageVm>({
      contentType: "FullMainPage",
      includeRelatedContent: "all",
    });
    return mapFullMainPageToVm(content);
  },
);
