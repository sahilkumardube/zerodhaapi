import { prisma } from "@/lib/db";
import { getInstruments } from "@/services/zerodha/kite-client";
import type { OptionContract } from "@/services/market-data.service";

function parseInstrumentsCsv(csv: string) {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

export async function refreshInstrumentCache(accessToken: string) {
  const csv = await getInstruments(accessToken);
  const rows = parseInstrumentsCsv(csv)
    .filter((r) => r.segment === "NFO-OPT" || r.segment === "BFO-OPT")
    .filter((r) => r.name === "NIFTY" || r.name === "SENSEX");

  for (const row of rows) {
    await prisma.instrumentCache.upsert({
      where: {
        exchange_tradingsymbol: {
          exchange: row.exchange,
          tradingsymbol: row.tradingsymbol,
        },
      },
      update: {
        token: row.instrument_token,
        data: row,
      },
      create: {
        exchange: row.exchange,
        tradingsymbol: row.tradingsymbol,
        token: row.instrument_token,
        data: row,
      },
    });
  }
}

export async function getOptionUniverse(dteAllowed: number[]): Promise<OptionContract[]> {
  const raw = await prisma.instrumentCache.findMany({
    where: {
      OR: [{ exchange: "NFO" }, { exchange: "BFO" }],
    },
  });

  const now = new Date();
  return raw
    .map((row) => {
      const data = row.data as Record<string, string>;
      const expiry = new Date(data.expiry);
      const dte = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        exchange: row.exchange,
        tradingsymbol: row.tradingsymbol,
        instrumentToken: row.token,
        indexType: data.name as "NIFTY" | "SENSEX",
        optionType: data.instrument_type as "CE" | "PE",
        strike: Number(data.strike),
        expiry: data.expiry,
        dte,
      };
    })
    .filter((x) => dteAllowed.includes(x.dte))
    .map((x) => ({
      exchange: x.exchange,
      tradingsymbol: x.tradingsymbol,
      instrumentToken: x.instrumentToken,
      indexType: x.indexType,
      optionType: x.optionType,
      strike: x.strike,
      expiry: x.expiry,
    }));
}
