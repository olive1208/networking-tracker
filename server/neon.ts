import "server-only";

import { createClient } from "@neondatabase/neon-js";

/**
 * Per-request Data API client that acts *as the signed-in user*: the browser
 * hands its Neon Auth JWT to a server action, and every query here carries that
 * JWT, so Postgres RLS (auth.user_id() = user_id) is enforced by the database,
 * not by application code.
 */
export function dataApiFor(token: string) {
  return createClient({
    dataApi: {
      url: process.env.NEXT_PUBLIC_NEON_DATA_API_URL!,
      getToken: async () => token,
    },
  });
}

/** Translate PostgREST / Postgres errors into a sentence a user can act on. */
export function describeDbError(error: { code?: string; message?: string } | null | undefined): string {
  switch (error?.code) {
    case "23514":
      return "That contact failed a database rule: name must not be blank and priority must be high, medium or low.";
    case "42501":
      return "You do not have permission to change that contact.";
    case "PGRST301":
    case "PGRST302":
      return "Your session has expired. Please sign in again.";
    default:
      return error?.message || "Something went wrong talking to the database.";
  }
}
