import { jsonOk } from "@/lib/http";
import { getLogsCached } from "@/services/read-models.service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 120), 300);
  const logs = await getLogsCached(limit);
  return jsonOk(logs);
}
