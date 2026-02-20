import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/http";

export async function GET() {
  const positions = await prisma.position.findMany({
    orderBy: { createdAt: "desc" },
    include: { trade: true },
  });
  return jsonOk(positions);
}
