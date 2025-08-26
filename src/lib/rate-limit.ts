interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TOKENS = 10;
const REFILL_WINDOW_MS = 60_000; // 1 minute
const REFILL_RATE = MAX_TOKENS / REFILL_WINDOW_MS; // tokens per ms

export function rateLimit(identifier: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(identifier) ?? {
    tokens: MAX_TOKENS,
    lastRefill: now,
  };

  const elapsed = now - bucket.lastRefill;
  bucket.tokens = Math.min(
    MAX_TOKENS,
    bucket.tokens + elapsed * REFILL_RATE,
  );
  bucket.lastRefill = now;

  if (bucket.tokens < 1) {
    buckets.set(identifier, bucket);
    return false;
  }

  bucket.tokens -= 1;
  buckets.set(identifier, bucket);
  return true;
}

export const RATE_LIMIT_MAX = MAX_TOKENS;
export const RATE_LIMIT_WINDOW = REFILL_WINDOW_MS;
