import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { saveAccessToken } from "@/services/auth-token.service";
import { generateSession } from "@/services/zerodha/kite-client";

export async function GET(req: NextRequest) {
  const requestToken = req.nextUrl.searchParams.get("request_token");
  if (!requestToken) {
    return jsonError("Missing request_token", 400);
  }

  try {
    const session = await generateSession(requestToken);
    await saveAccessToken({
      accessToken: session.access_token,
      userId: session.user_id,
      loginTime: session.login_time,
    });
    return NextResponse.redirect(new URL("/dashboard?auth=success", req.nextUrl.origin));
  } catch (error) {
    return jsonError(`Auth callback failed: ${String(error)}`, 500);
  }
}
