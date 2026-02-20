import { jsonError, jsonOk } from "@/lib/http";
import { runRiskCycle } from "@/services/risk-engine.service";

export async function POST() {
  try {
    const result = await runRiskCycle();
    return jsonOk(result);
  } catch (error) {
    return jsonError(String(error), 500);
  }
}
