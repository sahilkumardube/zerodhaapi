"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api-client";

export function usePositions() {
  return useQuery({
    queryKey: ["positions"],
    queryFn: async () => (await api.get("/positions?limit=120")).data.data,
    refetchInterval: 4000,
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get("/orders?limit=120")).data.data,
    refetchInterval: 5000,
  });
}

export function useRiskSummary() {
  return useQuery({
    queryKey: ["risk-summary"],
    queryFn: async () => (await api.get("/risk/summary")).data.data,
    refetchInterval: 3000,
  });
}

export function useStrategyState() {
  return useQuery({
    queryKey: ["strategy-state"],
    queryFn: async () => (await api.get("/strategy/state")).data.data,
    refetchInterval: 3000,
  });
}

export function useLogs() {
  return useQuery({
    queryKey: ["logs"],
    queryFn: async () => (await api.get("/logs?limit=120")).data.data,
    refetchInterval: 5000,
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => (await api.get("/dashboard/summary")).data.data,
    refetchInterval: 3000,
  });
}
