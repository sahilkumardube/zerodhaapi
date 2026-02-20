import { jsonError, jsonOk } from "@/lib/http";
import { runEntryCycle } from "@/services/strategy-engine.service";

export async function POST() {
  try {
    const result = await runEntryCycle();
    return jsonOk(result);
  } catch (error) {
    return jsonError(String(error), 500);
  }
}
