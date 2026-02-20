"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { usePositions, useRiskSummary, useStrategyState } from "@/hooks/use-trading-data";

export default function DashboardPage() {
  const { data: positions = [] } = usePositions();
  const { data: risk } = useRiskSummary();
  const { data: state } = useStrategyState();

  const totalPnl = Number(risk?.latest?.totalPnl ?? 0);
  const activeTrades = positions.filter((p: { status: string }) => p.status === "OPEN").length;
  const chartData = positions.slice(0, 20).map((p: { symbol: string; unrealizedPnl: number }, idx: number) => ({
    time: idx + 1,
    pnl: p.unrealizedPnl ?? 0,
    name: p.symbol,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardTitle>Total PnL</CardTitle>
          <CardContent className={totalPnl >= 0 ? "text-green-400" : "text-red-400"}>₹ {totalPnl.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardTitle>Active Legs</CardTitle>
          <CardContent>{activeTrades}</CardContent>
        </Card>
        <Card>
          <CardTitle>Strategy Status</CardTitle>
          <CardContent>{state?.status ?? "STOPPED"}</CardContent>
        </Card>
      </div>

      <Card className="h-72">
        <CardTitle>PnL Trend</CardTitle>
        <CardContent className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <XAxis dataKey="time" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip />
              <Area type="monotone" dataKey="pnl" stroke="#60a5fa" fill="#1d4ed8" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
