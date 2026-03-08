/**
 * GHL Token Resolver
 *
 * Resolves Private Integration Tokens for a given locationId
 * by looking them up in the Supabase `ghl_locations` table.
 *
 * Falls back to the GHL_PRIVATE_INTEGRATION_TOKEN env var
 * for backwards compatibility during development.
 */

import { createServerClient } from "@/lib/supabase/server";

interface GHLLocationRow {
  location_id: string;
  location_name: string;
  private_integration_token: string;
  is_active: boolean;
}

// In-memory cache to avoid hitting Supabase on every API call.
// Tokens rarely change — cache for 5 minutes.
const tokenCache = new Map<string, { token: string; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Resolve the Private Integration Token for a GHL location.
 *
 * Resolution order:
 * 1. In-memory cache
 * 2. Supabase `ghl_locations` table
 * 3. Fallback to GHL_PRIVATE_INTEGRATION_TOKEN env var (dev convenience)
 */
export async function resolveToken(locationId: string): Promise<string> {
  // 1. Check cache
  const cached = tokenCache.get(locationId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  // 2. Look up in Supabase
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("ghl_locations")
      .select("private_integration_token, is_active")
      .eq("location_id", locationId)
      .single();

    if (!error && data) {
      const row = data as unknown as GHLLocationRow;
      if (!row.is_active) {
        throw new Error(`GHL location ${locationId} is deactivated`);
      }

      tokenCache.set(locationId, {
        token: row.private_integration_token,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return row.private_integration_token;
    }
  } catch (err) {
    // If it's our own deactivation error, rethrow
    if (err instanceof Error && err.message.includes("deactivated")) {
      throw err;
    }
    // Otherwise fall through to env var fallback
  }

  // 3. Fallback to env var (dev / single-location mode)
  const envToken = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  if (envToken) {
    return envToken;
  }

  throw new Error(
    `No GHL token found for location ${locationId}. ` +
      `Add it in Settings or set GHL_PRIVATE_INTEGRATION_TOKEN env var.`
  );
}

/**
 * Invalidate the cached token for a location.
 * Call this when a token is updated via the admin UI.
 */
export function invalidateTokenCache(locationId: string) {
  tokenCache.delete(locationId);
}

/**
 * Clear the entire token cache.
 */
export function clearTokenCache() {
  tokenCache.clear();
}
