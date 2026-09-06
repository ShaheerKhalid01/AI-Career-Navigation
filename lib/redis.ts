import Redis from 'ioredis';

const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 0,
    connectTimeout: 500, // Fail fast in 500ms if not available
    enableOfflineQueue: false, // Prevent hanging commands while disconnected
    retryStrategy() {
      return null; // Do not reconnect
    }
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// Attach error listener to prevent unhandled 'error' events from crashing Node.js
redis.on('error', (err) => {
  // Suppress verbose error logging to avoid flooding the console
});

export default redis;
