import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/http";
import { formatDateKey } from "@/lib/time";

export async function GET() {
  const state = await prisma.strategyRun.findUnique({
    where: { dateKey: formatDateKey() },
  });
  return jsonOk(state);
}
