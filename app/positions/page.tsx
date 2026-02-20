"use client";

import { usePositions } from "@/hooks/use-trading-data";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function PositionsPage() {
  const { data: positions = [], isLoading } = usePositions();
  if (isLoading) return <div>Loading positions...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Positions</h1>
      <div className="grid gap-3">
        {positions.map(
          (p: {
            id: string;
            symbol: string;
            legType: string;
            quantity: number;
            entryPrice: number;
            ltp: number;
            slPrice: number;
            unrealizedPnl: number;
            status: string;
          }) => (
            <Card key={p.id}>
              <CardTitle>{p.symbol} - {p.legType}</CardTitle>
              <CardContent className="grid grid-cols-2 gap-2 md:grid-cols-6">
                <div>Qty: {p.quantity}</div>
                <div>Entry: {p.entryPrice?.toFixed?.(2) ?? "-"}</div>
                <div>LTP: {p.ltp?.toFixed?.(2) ?? "-"}</div>
                <div>SL: {p.slPrice?.toFixed?.(2) ?? "-"}</div>
                <div>PnL: {Number(p.unrealizedPnl ?? 0).toFixed(2)}</div>
                <div>Status: {p.status}</div>
              </CardContent>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}
