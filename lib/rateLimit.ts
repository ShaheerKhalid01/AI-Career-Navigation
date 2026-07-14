// Use global cache for serverless compatibility
declare global {
  var rateLimitCache: Map<string, { count: number; resetAt: number }> | undefined;
}

const requestCounts = global.rateLimitCache || new Map<string, { count: number; resetAt: number }>();

if (process.env.NODE_ENV !== 'production') {
  (global as any).rateLimitCache = requestCounts;
}

export function rateLimit(ip: string, limit = 30, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export function getRateLimitHeaders(ip: string, limit = 30, windowMs = 60000) {
  const entry = requestCounts.get(ip);
  const remaining = entry ? Math.max(0, limit - entry.count) : limit;
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(entry ? Math.ceil(entry.resetAt / 1000) : Math.ceil((Date.now() + windowMs) / 1000)),
  };
}
