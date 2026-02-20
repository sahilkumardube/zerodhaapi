import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/http";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 100), 300);
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      brokerOrderId: true,
      side: true,
      status: true,
      orderType: true,
      quantity: true,
      createdAt: true,
      retries: true,
      price: true,
      triggerPrice: true,
    },
  });
  return jsonOk(orders);
}
