import { jsonError, jsonOk } from "@/lib/http";
import { getLatestAccessToken } from "@/services/auth-token.service";
import { refreshInstrumentCache } from "@/services/instrument-cache.service";

export async function POST() {
  try {
    const token = await getLatestAccessToken();
    if (!token?.accessToken) {
      return jsonError("No access token", 400);
    }
    await refreshInstrumentCache(token.accessToken);
    return jsonOk({ refreshed: true });
  } catch (error) {
    return jsonError(String(error), 500);
  }
}
