import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/http";

export async function GET() {
  const logs = await prisma.systemEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return jsonOk(logs);
}
