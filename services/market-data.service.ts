import { getQuote } from "@/services/zerodha/kite-client";

export type OptionContract = {
  exchange: string;
  tradingsymbol: string;
  instrumentToken: string;
  indexType: "NIFTY" | "SENSEX";
  optionType: "CE" | "PE";
  strike: number;
  expiry: string;
};

export type QuoteMap = Record<
  string,
  {
    last_price: number;
    volume?: number;
  }
>;

export async function fetchPremiumMap(accessToken: string, contracts: OptionContract[]) {
  const instruments = contracts.map((c) => `${c.exchange}:${c.tradingsymbol}`);
  const quote = (await getQuote(accessToken, instruments)) as QuoteMap;
  return quote;
}
