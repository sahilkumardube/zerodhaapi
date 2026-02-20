import axios from "axios";
import { createHash } from "node:crypto";
import { env } from "@/lib/env";

const api = axios.create({
  baseURL: "https://api.kite.trade",
  timeout: 15000,
});

const authApi = axios.create({
  baseURL: "https://kite.zerodha.com",
  timeout: 15000,
});

export type KiteTokenResponse = {
  access_token: string;
  public_token?: string;
  user_id?: string;
  login_time?: string;
};

export function getKiteLoginUrl() {
  const params = new URLSearchParams({
    api_key: env.KITE_API_KEY,
    v: "3",
    redirect_params: "state=zerodha",
  });
  return `https://kite.zerodha.com/connect/login?${params.toString()}`;
}

export async function generateSession(requestToken: string): Promise<KiteTokenResponse> {
  const checksumHex = createHash("sha256")
    .update(`${env.KITE_API_KEY}${requestToken}${env.KITE_API_SECRET}`)
    .digest("hex");

  const body = new URLSearchParams({
    api_key: env.KITE_API_KEY,
    request_token: requestToken,
    checksum: checksumHex,
  });

  const response = await authApi.post("/session/token", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data.data;
}

type KiteHeaders = {
  Authorization: string;
  "X-Kite-Version": "3";
};

function kiteHeaders(accessToken: string): KiteHeaders {
  return {
    Authorization: `token ${env.KITE_API_KEY}:${accessToken}`,
    "X-Kite-Version": "3",
  };
}

export async function getPositions(accessToken: string) {
  const response = await api.get("/portfolio/positions", {
    headers: kiteHeaders(accessToken),
  });
  return response.data.data;
}

export async function getOrders(accessToken: string) {
  const response = await api.get("/orders", {
    headers: kiteHeaders(accessToken),
  });
  return response.data.data;
}

export async function getInstruments(accessToken: string) {
  const response = await api.get("/instruments", {
    headers: kiteHeaders(accessToken),
    responseType: "text",
  });
  return response.data as string;
}

export async function getQuote(accessToken: string, instruments: string[]) {
  const response = await api.get("/quote", {
    headers: kiteHeaders(accessToken),
    params: { i: instruments },
    paramsSerializer: { indexes: null },
  });
  return response.data.data;
}

type PlaceOrderRequest = {
  exchange: string;
  tradingsymbol: string;
  transaction_type: "BUY" | "SELL";
  quantity: number;
  order_type: "MARKET" | "LIMIT" | "SL" | "SL-M";
  product: "MIS";
  variety?: "regular";
  price?: number;
  trigger_price?: number;
};

export async function placeOrder(accessToken: string, body: PlaceOrderRequest) {
  const response = await api.post("/orders/regular", body, {
    headers: kiteHeaders(accessToken),
  });
  return response.data.data;
}
