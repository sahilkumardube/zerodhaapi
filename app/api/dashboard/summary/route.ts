import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/http";
import { cachedJson } from "@/lib/cache";
import { formatDateKey } from "@/lib/time";

export async function GET() {
  const data = await cachedJson("dashboard-summary", 2, async () => {
    const dateKey = formatDateKey();
    const [strategy, latestRisk, openPositions] = await Promise.all([
      prisma.strategyRun.findUnique({
        where: { dateKey },
        select: { status: true, riskLocked: true, niftyTrades: true, sensexTrades: true },
      }),
      prisma.riskSnapshot.findFirst({
        where: { dateKey },
        orderBy: { createdAt: "desc" },
        select: { totalPnl: true, totalRealized: true, totalUnrealized: true, maxLoss: true, createdAt: true },
      }),
      prisma.position.findMany({
        where: { status: "OPEN" },
        orderBy: { updatedAt: "desc" },
        take: 20,
        select: { symbol: true, unrealizedPnl: true, status: true },
      }),
    ]);

    return {
      strategy,
      latestRisk,
      activeLegs: openPositions.length,
      chartData: openPositions.map((p, idx) => ({
        time: idx + 1,
        name: p.symbol,
        pnl: p.unrealizedPnl,
      })),
    };
  });

  return jsonOk(data);
}
