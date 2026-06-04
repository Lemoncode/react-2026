import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  // Esto tendría que ir a una variable de entorno de cliente
  // y igual la podemos quitar porque tenemos auth y front en mismo server
  baseURL: "http://localhost:3000",
});
