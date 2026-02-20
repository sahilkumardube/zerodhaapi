import { jsonOk } from "@/lib/http";
import { getKiteLoginUrl } from "@/services/zerodha/kite-client";

export async function GET() {
  return jsonOk({ url: getKiteLoginUrl() });
}
