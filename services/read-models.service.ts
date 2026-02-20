import { cachedJson } from "@/lib/cache";
import { prisma } from "@/lib/db";
import { formatDateKey } from "@/lib/time";

export async function getDashboardSummaryCached() {
  return cachedJson("dashboard-summary", 2, async () => {
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
}

export async function getRiskSummaryCached() {
  return cachedJson("risk-summary", 2, async () => {
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
}

export async function getLogsCached(limit: number) {
  return cachedJson(`logs:${limit}`, 2, async () =>
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
}

export async function warmReadCaches() {
  await Promise.all([getDashboardSummaryCached(), getRiskSummaryCached(), getLogsCached(120), getLogsCached(50)]);
}
