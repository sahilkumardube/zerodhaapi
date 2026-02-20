import { jsonError, jsonOk } from "@/lib/http";
import { forceExitAllOpenPositions } from "@/services/exit-engine.service";

export async function POST() {
  try {
    const result = await forceExitAllOpenPositions();
    return jsonOk(result);
  } catch (error) {
    return jsonError(String(error), 500);
  }
}
