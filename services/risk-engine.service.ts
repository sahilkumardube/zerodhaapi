import { prisma } from "@/lib/db";
import { defaultStrategyConfig } from "@/lib/strategy-config";
import { formatDateKey } from "@/lib/time";
import { getLatestAccessToken } from "@/services/auth-token.service";
import { fetchPremiumMap } from "@/services/market-data.service";
import { logEvent } from "@/services/logger.service";
import { placeLegOrderWithRetry } from "@/services/order-execution.service";

export async function runRiskCycle() {
  const dateKey = formatDateKey();
  const token = await getLatestAccessToken();
  if (!token?.accessToken) {
    return { skipped: true, reason: "no token" };
  }

  const openPositions = await prisma.position.findMany({
    where: { status: "OPEN" },
    include: { trade: true },
  });
  if (!openPositions.length) {
    return { skipped: true, reason: "no open positions" };
  }

  const contracts = openPositions.map((p) => {
    const meta = p.metadata as Record<string, string>;
    return {
      exchange: String(meta.exchange),
      tradingsymbol: p.symbol,
      instrumentToken: String(meta.instrumentToken ?? ""),
      indexType: p.trade.indexType,
      optionType: p.legType.endsWith("CE") ? ("CE" as const) : ("PE" as const),
      strike: p.strike,
      expiry: p.expiry.toISOString(),
    };
  });

  const quote = await fetchPremiumMap(token.accessToken, contracts);
  let totalRealized = 0;
  let totalUnrealized = 0;

  for (const position of openPositions) {
    const meta = position.metadata as Record<string, string>;
    const key = `${meta.exchange}:${position.symbol}`;
    const ltp = quote[key]?.last_price ?? position.ltp ?? 0;
    const entry = position.entryPrice ?? 0;
    const multiplier = position.legType.startsWith("SHORT") ? -1 : 1;
    const unrealized = (ltp - entry) * position.quantity * multiplier;

    totalUnrealized += unrealized;
    totalRealized += position.realizedPnl;

    await prisma.position.update({
      where: { id: position.id },
      data: { ltp, unrealizedPnl: unrealized },
    });

    const isShortLeg = position.legType === "SHORT_CE" || position.legType === "SHORT_PE";
    if (isShortLeg && position.slPrice && ltp >= position.slPrice) {
      await placeLegOrderWithRetry({
        accessToken: token.accessToken,
        tradeId: position.tradeId,
        positionId: position.id,
        exchange: String(meta.exchange),
        tradingsymbol: position.symbol,
        quantity: position.quantity,
        side: "BUY",
      });

      await prisma.position.update({
        where: { id: position.id },
        data: { status: "STOPPED" },
      });

      // Move opposite short leg SL to cost.
      await prisma.position.updateMany({
        where: {
          tradeId: position.tradeId,
          status: "OPEN",
          OR: [{ legType: "SHORT_CE" }, { legType: "SHORT_PE" }],
          id: { not: position.id },
        },
        data: { slPrice: entry },
      });
    }
  }

  const totalPnl = totalRealized + totalUnrealized;
  await prisma.riskSnapshot.create({
    data: {
      dateKey,
      totalRealized,
      totalUnrealized,
      totalPnl,
      maxLoss: defaultStrategyConfig.maxDailyLoss,
    },
  });

  if (totalPnl <= -defaultStrategyConfig.maxDailyLoss) {
    await prisma.strategyRun.updateMany({
      where: { dateKey },
      data: {
        status: "LOCKED",
        riskLocked: true,
        lockReason: "Daily max loss breached",
      },
    });
    await logEvent("WARN", "risk-engine", "Daily max loss breached", { totalPnl });
  }

  return { skipped: false, totalPnl };
}
