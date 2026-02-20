import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1).default("postgresql://user:pass@localhost:5432/db"),
  REDIS_URL: z.string().optional(),
  REDIS_TOKEN: z.string().optional(),
  KITE_API_KEY: z.string().min(1).default("set-kite-api-key"),
  KITE_API_SECRET: z.string().min(1).default("set-kite-api-secret"),
  KITE_REDIRECT_URL: z.string().url().default("http://localhost:3000/api/auth/callback"),
  APP_ENCRYPTION_KEY: z.string().min(32).default("change-this-to-a-32-plus-character-secret"),
  INTERNAL_CRON_SECRET: z.string().min(12).default("change-this-cron-secret"),
  DEFAULT_TIMEZONE: z.string().default("Asia/Kolkata"),
  MAX_DAILY_LOSS: z.coerce.number().positive().default(10000),
});

export const env = envSchema.parse(process.env);
