import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/http";

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });
  return jsonOk(orders);
}
