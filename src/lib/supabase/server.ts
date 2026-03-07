import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let serverClient: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Server-side Supabase client using service role key.
 * Bypasses RLS — use only in API route handlers, never in client code.
 */
export function createServerClient() {
  if (serverClient) return serverClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase server credentials not configured (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)"
    );
  }

  serverClient = createSupabaseClient(url, serviceRoleKey);
  return serverClient;
}
