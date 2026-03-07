/**
 * GoHighLevel API v2 Client
 * 
 * Centralized HTTP client for all GHL API interactions.
 * Handles authentication, rate limiting, retries, and error normalization.
 * 
 * ALL GHL API calls in the app MUST go through this client.
 * Never import fetch directly for GHL endpoints.
 */

const GHL_BASE_URL = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

// ─── Rate Limiting ───
// GHL allows 100 requests per 10 seconds per location
const RATE_LIMIT_WINDOW_MS = 10_000;
const RATE_LIMIT_MAX_REQUESTS = 100;

interface RateLimitState {
  requests: number[];
}

const rateLimitByLocation = new Map<string, RateLimitState>();

function checkRateLimit(locationId: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  let state = rateLimitByLocation.get(locationId);
  
  if (!state) {
    state = { requests: [] };
    rateLimitByLocation.set(locationId, state);
  }

  // Remove requests outside the window
  state.requests = state.requests.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (state.requests.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldestInWindow = state.requests[0];
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - oldestInWindow);
    return { allowed: false, retryAfterMs };
  }

  state.requests.push(now);
  return { allowed: true, retryAfterMs: 0 };
}

// ─── Error Types ───

export class GHLApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string,
    public responseBody?: unknown
  ) {
    super(message);
    this.name = 'GHLApiError';
  }
}

export class GHLRateLimitError extends GHLApiError {
  constructor(endpoint: string, public retryAfterMs: number) {
    super(`Rate limit exceeded for ${endpoint}`, 429, endpoint);
    this.name = 'GHLRateLimitError';
  }
}

// ─── Client ───

interface GHLRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown>;
  params?: Record<string, string | number | boolean | undefined>;
  locationId?: string; // Override default location
  maxRetries?: number;
}

interface GHLResponse<T> {
  data: T;
  statusCode: number;
  rateLimitRemaining?: number;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make an authenticated request to the GHL API.
 * 
 * @param endpoint - API path (e.g., '/contacts/abc123')
 * @param options - Request options
 * @returns Typed response data
 * 
 * @example
 * const contact = await ghlRequest<GHLContact>('/contacts/abc123');
 * const contacts = await ghlRequest<GHLContactList>('/contacts/', { params: { limit: 20 } });
 * await ghlRequest('/contacts/abc123', { method: 'PUT', body: { firstName: 'Brady' } });
 */
export async function ghlRequest<T = unknown>(
  endpoint: string,
  options: GHLRequestOptions = {}
): Promise<GHLResponse<T>> {
  const {
    method = 'GET',
    body,
    params,
    locationId = process.env.GHL_DEFAULT_LOCATION_ID!,
    maxRetries = 3,
  } = options;

  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  if (!token) {
    throw new Error('GHL_PRIVATE_INTEGRATION_TOKEN is not set');
  }

  // Build URL with query params
  const url = new URL(endpoint, GHL_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  // Rate limit check
  const rateCheck = checkRateLimit(locationId);
  if (!rateCheck.allowed) {
    // Wait and retry rather than throwing immediately
    await sleep(rateCheck.retryAfterMs);
  }

  // Retry loop with exponential backoff
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Version': GHL_API_VERSION,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      // Handle rate limit from GHL side
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 2000 * (attempt + 1);
        
        if (attempt < maxRetries) {
          await sleep(waitMs);
          continue;
        }
        throw new GHLRateLimitError(endpoint, waitMs);
      }

      // Handle other errors
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new GHLApiError(
          `GHL API error: ${response.status} ${response.statusText}`,
          response.status,
          endpoint,
          errorBody
        );
      }

      // Parse response
      const data = await response.json() as T;

      return {
        data,
        statusCode: response.status,
        rateLimitRemaining: response.headers.get('x-ratelimit-remaining')
          ? parseInt(response.headers.get('x-ratelimit-remaining')!)
          : undefined,
      };
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (except 429 which is handled above)
      if (error instanceof GHLApiError && error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }

      // Exponential backoff for server errors and network failures
      if (attempt < maxRetries) {
        await sleep(1000 * Math.pow(2, attempt));
        continue;
      }
    }
  }

  throw lastError || new Error(`GHL request failed after ${maxRetries} retries: ${endpoint}`);
}

// ─── Convenience Methods ───

export const ghl = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>, locationId?: string) =>
    ghlRequest<T>(endpoint, { method: 'GET', params, locationId }),

  post: <T>(endpoint: string, body: Record<string, unknown>, locationId?: string) =>
    ghlRequest<T>(endpoint, { method: 'POST', body, locationId }),

  put: <T>(endpoint: string, body: Record<string, unknown>, locationId?: string) =>
    ghlRequest<T>(endpoint, { method: 'PUT', body, locationId }),

  delete: <T>(endpoint: string, locationId?: string) =>
    ghlRequest<T>(endpoint, { method: 'DELETE', locationId }),
};
