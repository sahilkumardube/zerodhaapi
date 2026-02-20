import { NextRequest } from "next/server";
import { assertInternalCronAuth, jsonError, jsonOk } from "@/lib/http";
import { warmReadCaches } from "@/services/read-models.service";

export async function POST(req: NextRequest) {
  try {
    assertInternalCronAuth(req);
    await warmReadCaches();
    return jsonOk({ warmed: true });
  } catch (error) {
    return jsonError(String(error), 500);
  }
}
