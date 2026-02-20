import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const trade = await prisma.trade.findUnique({
    where: { id },
    include: { positions: true, orders: true },
  });
  if (!trade) {
    return jsonError("Trade not found", 404);
  }
  return jsonOk(trade);
}
