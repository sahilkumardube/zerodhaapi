"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api-client";

export function usePositions() {
  return useQuery({
    queryKey: ["positions"],
    queryFn: async () => (await api.get("/positions")).data.data,
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get("/orders")).data.data,
  });
}

export function useRiskSummary() {
  return useQuery({
    queryKey: ["risk-summary"],
    queryFn: async () => (await api.get("/risk/summary")).data.data,
  });
}

export function useStrategyState() {
  return useQuery({
    queryKey: ["strategy-state"],
    queryFn: async () => (await api.get("/strategy/state")).data.data,
  });
}

export function useLogs() {
  return useQuery({
    queryKey: ["logs"],
    queryFn: async () => (await api.get("/logs")).data.data,
  });
}
