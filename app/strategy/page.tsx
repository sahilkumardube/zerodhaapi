"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useStrategyState } from "@/hooks/use-trading-data";
import { api } from "@/services/api-client";

export default function StrategyPage() {
  const qc = useQueryClient();
  const { data } = useStrategyState();
  const [busy, setBusy] = useState(false);

  const runAction = async (path: string) => {
    setBusy(true);
    try {
      await api.post(path);
      await qc.invalidateQueries({ queryKey: ["strategy-state"] });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Strategy Controls</h1>
      <Card>
        <CardTitle>Engine</CardTitle>
        <CardContent className="space-y-3">
          <div>Status: {data?.status ?? "STOPPED"}</div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy} onClick={() => runAction("/strategy/start")}>Start</Button>
            <Button disabled={busy} variant="danger" onClick={() => runAction("/strategy/stop")}>Stop</Button>
            <Button disabled={busy} variant="outline" onClick={() => runAction("/trade/execute")}>Run Entry Now</Button>
            <Button disabled={busy} variant="outline" onClick={() => runAction("/risk/run")}>Run Risk Check</Button>
            <Button disabled={busy} variant="outline" onClick={() => runAction("/trade/exit")}>Force Exit</Button>
            <Button disabled={busy} variant="outline" onClick={() => runAction("/strategy/refresh-instruments")}>Refresh Instruments</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
