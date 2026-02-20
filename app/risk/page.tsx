"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useRiskSummary } from "@/hooks/use-trading-data";

export default function RiskPage() {
  const { data, isLoading } = useRiskSummary();
  if (isLoading) return <div>Loading risk summary...</div>;

  const latest = data?.latest;
  const strategy = data?.strategy;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Risk</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle>Daily PnL</CardTitle>
          <CardContent className="space-y-1">
            <div>Total: {Number(latest?.totalPnl ?? 0).toFixed(2)}</div>
            <div>Realized: {Number(latest?.totalRealized ?? 0).toFixed(2)}</div>
            <div>Unrealized: {Number(latest?.totalUnrealized ?? 0).toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardTitle>Circuit Breakers</CardTitle>
          <CardContent className="space-y-1">
            <div>Max Loss: {Number(latest?.maxLoss ?? 0).toFixed(2)}</div>
            <div>Risk Locked: {String(strategy?.riskLocked ?? false)}</div>
            <div>Reason: {strategy?.lockReason ?? "-"}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
