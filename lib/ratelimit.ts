import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '@/lib/env';

let ratelimitInstance: Ratelimit | null = null;

if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimitInstance = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
  });
}

export async function checkRateLimit(identifier: string): Promise<{ success: boolean }> {
  if (!ratelimitInstance) {
    // If Upstash Redis is not configured, fall back gracefully to allow requests in dev/test
    return { success: true };
  }

  try {
    const result = await ratelimitInstance.limit(identifier);
    return { success: result.success };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { success: true }; // Fallback to allow request if rate limit service fails
  }
}
