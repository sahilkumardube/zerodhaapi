import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/http";
import { formatDateKey } from "@/lib/time";

export async function GET() {
  const dateKey = formatDateKey();
  const latest = await prisma.riskSnapshot.findFirst({
    where: { dateKey },
    orderBy: { createdAt: "desc" },
  });
  const strategy = await prisma.strategyRun.findUnique({ where: { dateKey } });
  return jsonOk({ latest, strategy });
}
