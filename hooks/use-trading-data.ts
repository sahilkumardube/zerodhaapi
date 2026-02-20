"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api-client";
import { getMarketTimingState } from "@/lib/market-hours";

function adaptiveInterval(msWhenActive: number, msWhenIdle: number) {
  const { isMarketOpen } = getMarketTimingState();
  return isMarketOpen ? msWhenActive : msWhenIdle;
}

export function usePositions() {
  return useQuery({
    queryKey: ["positions"],
    queryFn: async () => (await api.get("/positions?limit=120")).data.data,
    refetchInterval: () => adaptiveInterval(3000, 12000),
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get("/orders?limit=120")).data.data,
    refetchInterval: () => adaptiveInterval(4000, 15000),
  });
}

export function useRiskSummary() {
  return useQuery({
    queryKey: ["risk-summary"],
    queryFn: async () => (await api.get("/risk/summary")).data.data,
    refetchInterval: () => adaptiveInterval(2500, 10000),
  });
}

export function useStrategyState() {
  return useQuery({
    queryKey: ["strategy-state"],
    queryFn: async () => (await api.get("/strategy/state")).data.data,
    refetchInterval: () => adaptiveInterval(2500, 10000),
  });
}

export function useLogs() {
  return useQuery({
    queryKey: ["logs"],
    queryFn: async () => (await api.get("/logs?limit=120")).data.data,
    refetchInterval: () => adaptiveInterval(5000, 20000),
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => (await api.get("/dashboard/summary")).data.data,
    refetchInterval: () => adaptiveInterval(2000, 8000),
  });
}
