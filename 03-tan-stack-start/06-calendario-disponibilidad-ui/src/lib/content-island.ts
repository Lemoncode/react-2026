import { createClient } from "@content-island/api-client";

export const contentIslandClient = createClient({
  accessToken: process.env.CONTENT_ISLAND_ACCESS_TOKEN!,
});
