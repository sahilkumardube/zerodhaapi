import { jsonOk, jsonError } from "@/lib/http";
import { startStrategy } from "@/services/strategy-engine.service";

export async function POST() {
  try {
    const state = await startStrategy();
    return jsonOk(state);
  } catch (error) {
    return jsonError(String(error), 500);
  }
}
