import type { IndexType, LegType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { defaultStrategyConfig, lotSize } from "@/lib/strategy-config";
import { formatDateKey, isBetweenMinutes, nowInIST } from "@/lib/time";
import { fetchPremiumMap } from "@/services/market-data.service";
import { placeLegOrderWithRetry } from "@/services/order-execution.service";
import { selectStrangles } from "@/services/strike-selection.service";
import { getLatestAccessToken } from "@/services/auth-token.service";
import { getOptionUniverse } from "@/services/instrument-cache.service";
import { logEvent } from "@/services/logger.service";

async function getOrCreateRunState() {
  const dateKey = formatDateKey();
  return prisma.strategyRun.upsert({
    where: { dateKey },
    update: {},
    create: {
      dateKey,
      status: "STOPPED",
      config: defaultStrategyConfig,
    },
  });
}

export async function startStrategy() {
  const run = await getOrCreateRunState();
  return prisma.strategyRun.update({
    where: { id: run.id },
    data: { status: "RUNNING", startedAt: new Date(), riskLocked: false, lockReason: null },
  });
}

export async function stopStrategy() {
  const run = await getOrCreateRunState();
  return prisma.strategyRun.update({
    where: { id: run.id },
    data: { status: "STOPPED", stoppedAt: new Date() },
  });
}

export async function runEntryCycle() {
  const now = nowInIST();
  if (!isBetweenMinutes(now, "09:20", "09:30")) {
    return { skipped: true, reason: "outside entry window" };
  }

  const run = await getOrCreateRunState();
  if (run.status !== "RUNNING" || run.riskLocked) {
    return { skipped: true, reason: "strategy stopped or risk-locked" };
  }

  const token = await getLatestAccessToken();
  if (!token?.accessToken) {
    throw new Error("No Zerodha access token available");
  }

  const cfg = defaultStrategyConfig;
  const universe = await getOptionUniverse(cfg.allowedDte);
  const quote = await fetchPremiumMap(token.accessToken, universe);

  const out: string[] = [];
  for (const indexType of ["NIFTY", "SENSEX"] as IndexType[]) {
    const currentCount = indexType === "NIFTY" ? run.niftyTrades : run.sensexTrades;
    if (currentCount >= cfg.maxTradesPerIndex) {
      out.push(`${indexType}: max trades reached`);
      continue;
    }

    const picked = selectStrangles(indexType, universe, quote, cfg);
    const qty = lotSize(indexType, cfg);

    const trade = await prisma.trade.create({
      data: {
        indexType,
        symbol: indexType,
        batchNo: currentCount + 1,
        entryTime: new Date(),
        status: "ACTIVE",
        configSnapshot: cfg,
      },
    });

    const legs: { legType: LegType; contract: (typeof picked)[keyof typeof picked]; side: "BUY" | "SELL" }[] = [
      { legType: "SHORT_CE", contract: picked.shortCe, side: "SELL" as const },
      { legType: "SHORT_PE", contract: picked.shortPe, side: "SELL" as const },
      { legType: "LONG_CE", contract: picked.longCe, side: "BUY" as const },
      { legType: "LONG_PE", contract: picked.longPe, side: "BUY" as const },
    ];

    for (const leg of legs) {
      const key = `${leg.contract.exchange}:${leg.contract.tradingsymbol}`;
      const premium = quote[key]?.last_price ?? 0;
      const slPrice =
        leg.legType === "SHORT_CE" || leg.legType === "SHORT_PE"
          ? premium * (1 + cfg.stopLossPct / 100)
          : null;
      const position = await prisma.position.create({
        data: {
          tradeId: trade.id,
          legType: leg.legType,
          symbol: leg.contract.tradingsymbol,
          strike: leg.contract.strike,
          expiry: new Date(leg.contract.expiry),
          quantity: qty,
          entryPrice: premium,
          ltp: premium,
          slPrice: slPrice ?? undefined,
          status: "OPEN",
          metadata: leg.contract,
        },
      });

      await placeLegOrderWithRetry({
        accessToken: token.accessToken,
        tradeId: trade.id,
        positionId: position.id,
        exchange: leg.contract.exchange,
        tradingsymbol: leg.contract.tradingsymbol,
        quantity: qty,
        side: leg.side,
      });
    }

    await prisma.strategyRun.update({
      where: { id: run.id },
      data:
        indexType === "NIFTY"
          ? { niftyTrades: { increment: 1 } }
          : { sensexTrades: { increment: 1 } },
    });
    out.push(`${indexType}: trade batch ${currentCount + 1} executed`);
  }

  await logEvent("INFO", "strategy-engine", "Entry cycle completed", { out });
  return { skipped: false, out };
}
