import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/http";
import { cachedJson } from "@/lib/cache";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 120), 300);
  const logs = await cachedJson(`logs:${limit}`, 2, async () =>
    prisma.systemEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        level: true,
        source: true,
        message: true,
        createdAt: true,
      },
    }),
  );
  return jsonOk(logs);
}
