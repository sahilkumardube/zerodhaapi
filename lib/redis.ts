import { Redis } from "@upstash/redis";
import { randomUUID } from "node:crypto";

let redisClient: Redis | null = null;

export function getRedis() {
  if (!process.env.REDIS_URL || !process.env.REDIS_TOKEN) {
    return null;
  }
  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN,
    });
  }
  return redisClient;
}

export async function withDistributedLock<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
): Promise<T | null> {
  const redis = getRedis();
  if (!redis) {
    return fn();
  }

  const lockKey = `lock:${key}`;
  const token = randomUUID();
  const acquired = await redis.set(lockKey, token, { nx: true, ex: ttlSeconds });
  if (!acquired) {
    return null;
  }

  try {
    return await fn();
  } finally {
    const current = await redis.get<string>(lockKey);
    if (current === token) {
      await redis.del(lockKey);
    }
  }
}
