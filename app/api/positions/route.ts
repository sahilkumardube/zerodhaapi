import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/http";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 100), 300);
  const positions = await prisma.position.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      symbol: true,
      legType: true,
      quantity: true,
      entryPrice: true,
      ltp: true,
      slPrice: true,
      unrealizedPnl: true,
      realizedPnl: true,
      status: true,
      createdAt: true,
      trade: {
        select: {
          id: true,
          indexType: true,
          batchNo: true,
          status: true,
        },
      },
    },
  });
  return jsonOk(positions);
}
