"use client";

import { createClient } from "@neondatabase/neon-js";
import { BetterAuthReactAdapter } from "@neondatabase/neon-js/auth/react/adapters";

/**
 * Browser-side Neon client (two-URL object form).
 * - `neon.auth` is the Better Auth client: signUp.email / signIn.email / signOut / useSession.
 * - All contact reads and writes go through the server actions in `server/contacts.ts`
 *   so that validation runs server-side; the browser only owns the session.
 */
export const neon = createClient({
  auth: {
    url: process.env.NEXT_PUBLIC_NEON_AUTH_URL!,
    adapter: BetterAuthReactAdapter(),
  },
  dataApi: {
    url: process.env.NEXT_PUBLIC_NEON_DATA_API_URL!,
  },
});

/**
 * The JWT the Data API expects. The Neon SDK replaces `session.token` with the
 * JWT delivered in the `set-auth-jwt` response header; this is the same value
 * the SDK uses internally for its own Data API calls.
 */
export async function getAccessToken(): Promise<string | null> {
  const { data } = await neon.auth.getSession();
  return data?.session?.token ?? null;
}
