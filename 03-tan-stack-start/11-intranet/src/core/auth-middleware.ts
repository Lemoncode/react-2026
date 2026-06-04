import { auth } from "@/lib/auth";
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

/**
 * Auth guard for server functions.
 *
 * A route `loader` only protects the *page*; the server function it calls is
 * still exposed as its own RPC endpoint (`/_serverFn/...`) reachable directly
 * (e.g. from Postman). This middleware runs inside that endpoint, so any call
 * without a valid session is rejected with a 401 before the handler runs.
 *
 * Apply it to every intranet server function that returns owner-only data:
 *
 *   createServerFn({ method: "GET" })
 *     .middleware([authMiddleware])
 *     .handler(async ({ context }) => { context.session ... })
 */
export const authMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || !session.user) {
      throw new Response("Unauthorized", { status: 401 });
    }

    return next({ context: { session } });
  },
);
