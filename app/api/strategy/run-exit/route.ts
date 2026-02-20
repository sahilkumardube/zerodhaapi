import { NextRequest } from "next/server";
import { assertInternalCronAuth, jsonError, jsonOk } from "@/lib/http";
import { withDistributedLock } from "@/lib/redis";
import { forceExitAllOpenPositions } from "@/services/exit-engine.service";

export async function POST(req: NextRequest) {
  try {
    assertInternalCronAuth(req);
    const result = await withDistributedLock("run-exit", 60, () => forceExitAllOpenPositions());
    if (!result) return jsonOk({ skipped: true, reason: "lock busy" });
    return jsonOk(result);
  } catch (error) {
    return jsonError(String(error), 500);
  }
}
