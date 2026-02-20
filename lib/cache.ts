import { getRedis } from "@/lib/redis";

export async function cachedJson<T>(
  key: string,
  ttlSeconds: number,
  resolver: () => Promise<T>,
): Promise<T> {
  const redis = getRedis();
  if (!redis) {
    return resolver();
  }

  const cached = await redis.get<T>(`cache:${key}`);
  if (cached) {
    return cached;
  }

  const value = await resolver();
  await redis.set(`cache:${key}`, value, { ex: ttlSeconds });
  return value;
}
