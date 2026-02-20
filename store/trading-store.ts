"use client";

import { create } from "zustand";

type TradingState = {
  pnl: number;
  strategyStatus: string;
  setPnl: (pnl: number) => void;
  setStrategyStatus: (status: string) => void;
};

export const useTradingStore = create<TradingState>((set) => ({
  pnl: 0,
  strategyStatus: "STOPPED",
  setPnl: (pnl) => set({ pnl }),
  setStrategyStatus: (strategyStatus) => set({ strategyStatus }),
}));
