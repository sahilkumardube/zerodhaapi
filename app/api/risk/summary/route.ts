import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/http";
import { cachedJson } from "@/lib/cache";
import { formatDateKey } from "@/lib/time";

export async function GET() {
  const data = await cachedJson("risk-summary", 2, async () => {
    const dateKey = formatDateKey();
    const [latest, strategy] = await Promise.all([
      prisma.riskSnapshot.findFirst({
        where: { dateKey },
        orderBy: { createdAt: "desc" },
        select: {
          totalRealized: true,
          totalUnrealized: true,
          totalPnl: true,
          maxLoss: true,
          marginUsed: true,
          createdAt: true,
        },
      }),
      prisma.strategyRun.findUnique({
        where: { dateKey },
        select: {
          status: true,
          riskLocked: true,
          lockReason: true,
          niftyTrades: true,
          sensexTrades: true,
        },
      }),
    ]);

    return { latest, strategy };
  });
  return jsonOk(data);
}
