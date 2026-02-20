import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function logEvent(
  level: "INFO" | "WARN" | "ERROR",
  source: string,
  message: string,
  payload?: Record<string, unknown>,
) {
  await prisma.systemEvent.create({
    data: {
      level,
      source,
      message,
      payload: (payload ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}
