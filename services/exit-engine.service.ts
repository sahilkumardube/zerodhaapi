import { prisma } from "@/lib/db";
import { getLatestAccessToken } from "@/services/auth-token.service";
import { placeLegOrderWithRetry } from "@/services/order-execution.service";
import { logEvent } from "@/services/logger.service";

export async function forceExitAllOpenPositions() {
  const token = await getLatestAccessToken();
  if (!token?.accessToken) {
    return { skipped: true, reason: "no token" };
  }

  const openPositions = await prisma.position.findMany({
    where: { status: "OPEN" },
  });
  if (!openPositions.length) {
    return { skipped: true, reason: "no open positions" };
  }

  for (const position of openPositions) {
    const meta = position.metadata as Record<string, string>;
    const side = position.legType.startsWith("SHORT") ? "BUY" : "SELL";
    await placeLegOrderWithRetry({
      accessToken: token.accessToken,
      tradeId: position.tradeId,
      positionId: position.id,
      exchange: String(meta.exchange),
      tradingsymbol: position.symbol,
      quantity: position.quantity,
      side,
    });
    await prisma.position.update({
      where: { id: position.id },
      data: { status: "CLOSED", realizedPnl: (position.realizedPnl ?? 0) + (position.unrealizedPnl ?? 0) },
    });
  }

  await prisma.trade.updateMany({
    where: { status: "ACTIVE" },
    data: { status: "EXITED", exitTime: new Date() },
  });

  await logEvent("INFO", "exit-engine", "Force exited all positions");
  return { skipped: false, count: openPositions.length };
}
