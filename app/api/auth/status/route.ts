import { jsonOk } from "@/lib/http";
import { getLatestAccessToken } from "@/services/auth-token.service";

export async function GET() {
  const token = await getLatestAccessToken();
  return jsonOk({
    authenticated: Boolean(token?.accessToken),
    userId: token?.userId ?? null,
    loginTime: token?.loginTime ?? null,
  });
}
