import { createServerFn } from "@tanstack/react-start";
import { contentIslandClient } from "@/lib/content-island";
import type { FooterSection, HeaderSection } from "./layout.model";

export const getHeaderContent = createServerFn({ method: "GET" }).handler(
  async () =>
    await contentIslandClient.getContent<HeaderSection>({
      contentType: "HeaderSection",
      includeRelatedContent: "all",
    }),
);

export const getFooterContent = createServerFn({ method: "GET" }).handler(
  async () =>
    await contentIslandClient.getContent<FooterSection>({
      contentType: "FooterSection",
      includeRelatedContent: "all",
    }),
);
