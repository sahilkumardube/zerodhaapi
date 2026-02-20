import { jsonOk } from "@/lib/http";
import { getDashboardSummaryCached } from "@/services/read-models.service";

export async function GET() {
  const data = await getDashboardSummaryCached();
  return jsonOk(data);
}
