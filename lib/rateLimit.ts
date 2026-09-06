import redis from './redis';

export async function rateLimit(ip: string, limit = 30, windowMs = 60000): Promise<boolean> {
  const windowSeconds = Math.ceil(windowMs / 1000);
  const key = `ratelimit:${ip}`;
  
  const currentCount = await redis.incr(key);
  
  if (currentCount === 1) {
    await redis.expire(key, windowSeconds);
  }
  
  return currentCount <= limit;
}

export async function getRateLimitHeaders(ip: string, limit = 30, windowMs = 60000) {
  const key = `ratelimit:${ip}`;
  const currentCountStr = await redis.get(key);
  const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;
  
  const remaining = Math.max(0, limit - currentCount);
  
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(remaining),
  };
}
