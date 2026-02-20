import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export function jsonOk(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export function assertInternalCronAuth(req: NextRequest) {
  const secret = req.headers.get("x-internal-cron-secret");
  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (secret !== env.INTERNAL_CRON_SECRET && bearer !== env.INTERNAL_CRON_SECRET) {
    throw new Error("Unauthorized cron request");
  }
}
