import { NextRequest } from "next/server";
import { assertInternalCronAuth, jsonError, jsonOk } from "@/lib/http";
import { withDistributedLock } from "@/lib/redis";
import { warmReadCaches } from "@/services/read-models.service";
import { runRiskCycle } from "@/services/risk-engine.service";

export async function POST(req: NextRequest) {
  try {
    assertInternalCronAuth(req);
    const result = await withDistributedLock("run-risk", 20, () => runRiskCycle());
    if (!result) return jsonOk({ skipped: true, reason: "lock busy" });
    void warmReadCaches().catch(() => undefined);
    return jsonOk(result);
  } catch (error) {
    return jsonError(String(error), 500);
  }
}
