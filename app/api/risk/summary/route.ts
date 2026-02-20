import { jsonOk } from "@/lib/http";
import { getRiskSummaryCached } from "@/services/read-models.service";

export async function GET() {
  const data = await getRiskSummaryCached();
  return jsonOk(data);
}
