import { betterAuth } from "better-auth";
import { getDb } from "./mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { tanstackStartCookies } from "better-auth/tanstack-start";

const db = await getDb();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  url: process.env.BETTER_AUTH_URL,
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies()],
});
