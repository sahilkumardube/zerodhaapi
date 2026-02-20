import type { IndexType } from "@prisma/client";
import { hedgeBand, premiumTarget, type StrategyConfig } from "@/lib/strategy-config";
import type { OptionContract, QuoteMap } from "@/services/market-data.service";

type SelectedStrikes = {
  shortCe: OptionContract;
  shortPe: OptionContract;
  longCe: OptionContract;
  longPe: OptionContract;
};

function closestByPremium(
  contracts: OptionContract[],
  quote: QuoteMap,
  target: number,
  optionType: "CE" | "PE",
) {
  const filtered = contracts.filter((c) => c.optionType === optionType);
  return filtered
    .map((c) => {
      const key = `${c.exchange}:${c.tradingsymbol}`;
      const premium = quote[key]?.last_price ?? Number.MAX_SAFE_INTEGER;
      return { contract: c, premium, distance: Math.abs(premium - target) };
    })
    .sort((a, b) => a.distance - b.distance)[0]?.contract;
}

function hedgeByBand(
  contracts: OptionContract[],
  quote: QuoteMap,
  bandMin: number,
  bandMax: number,
  optionType: "CE" | "PE",
) {
  return contracts
    .filter((c) => c.optionType === optionType)
    .map((c) => {
      const key = `${c.exchange}:${c.tradingsymbol}`;
      return { contract: c, premium: quote[key]?.last_price ?? 0 };
    })
    .filter((x) => x.premium >= bandMin && x.premium <= bandMax)
    .sort((a, b) => Math.abs(a.premium - (bandMin + bandMax) / 2) - Math.abs(b.premium - (bandMin + bandMax) / 2))[0]
    ?.contract;
}

export function selectStrangles(
  indexType: IndexType,
  contracts: OptionContract[],
  quote: QuoteMap,
  cfg: StrategyConfig,
): SelectedStrikes {
  const indexContracts = contracts.filter((c) => c.indexType === indexType);
  const target = premiumTarget(indexType, cfg);
  const band = hedgeBand(indexType, cfg);

  const shortCe = closestByPremium(indexContracts, quote, target, "CE");
  const shortPe = closestByPremium(indexContracts, quote, target, "PE");
  const longCe = hedgeByBand(indexContracts, quote, band.min, band.max, "CE");
  const longPe = hedgeByBand(indexContracts, quote, band.min, band.max, "PE");

  if (!shortCe || !shortPe || !longCe || !longPe) {
    throw new Error(`Strike selection failed for ${indexType}`);
  }

  return { shortCe, shortPe, longCe, longPe };
}
