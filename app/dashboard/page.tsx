"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useDashboardSummary } from "@/hooks/use-trading-data";

export default function DashboardPage() {
  const { data } = useDashboardSummary();
  const totalPnl = Number(data?.latestRisk?.totalPnl ?? 0);
  const activeTrades = Number(data?.activeLegs ?? 0);
  const chartData = useMemo(() => data?.chartData ?? [], [data?.chartData]);

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
          <CardContent>{data?.strategy?.status ?? "STOPPED"}</CardContent>
        </Card>
      </div>

      <Card className="min-h-72">
        <CardTitle>PnL Trend</CardTitle>
        <CardContent className="h-[280px] min-h-[280px]">
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
