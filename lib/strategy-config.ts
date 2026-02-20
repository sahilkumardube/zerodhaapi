import type { IndexType } from "@prisma/client";

export type StrategyConfig = {
  niftyShortTarget: number;
  niftyHedgeMin: number;
  niftyHedgeMax: number;
  sensexShortTarget: number;
  sensexHedgeMin: number;
  sensexHedgeMax: number;
  stopLossPct: number;
  maxTradesPerIndex: number;
  maxDailyLoss: number;
  allowedDte: number[];
  lotSizeNifty: number;
  lotSizeSensex: number;
};

export const defaultStrategyConfig: StrategyConfig = {
  niftyShortTarget: 75,
  niftyHedgeMin: 120,
  niftyHedgeMax: 150,
  sensexShortTarget: 225,
  sensexHedgeMin: 260,
  sensexHedgeMax: 340,
  stopLossPct: 50,
  maxTradesPerIndex: 2,
  maxDailyLoss: Number(process.env.MAX_DAILY_LOSS ?? 10000),
  allowedDte: [0, 1],
  lotSizeNifty: 75,
  lotSizeSensex: 10,
};

export function premiumTarget(indexType: IndexType, cfg: StrategyConfig) {
  return indexType === "NIFTY" ? cfg.niftyShortTarget : cfg.sensexShortTarget;
}

export function hedgeBand(indexType: IndexType, cfg: StrategyConfig) {
  return indexType === "NIFTY"
    ? { min: cfg.niftyHedgeMin, max: cfg.niftyHedgeMax }
    : { min: cfg.sensexHedgeMin, max: cfg.sensexHedgeMax };
}

export function lotSize(indexType: IndexType, cfg: StrategyConfig) {
  return indexType === "NIFTY" ? cfg.lotSizeNifty : cfg.lotSizeSensex;
}
