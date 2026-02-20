import { jsonOk, jsonError } from "@/lib/http";
import { stopStrategy } from "@/services/strategy-engine.service";

export async function POST() {
  try {
    const state = await stopStrategy();
    return jsonOk(state);
  } catch (error) {
    return jsonError(String(error), 500);
  }
}
