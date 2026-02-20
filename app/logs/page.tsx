"use client";

import { useLogs } from "@/hooks/use-trading-data";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function LogsPage() {
  const { data: logs = [], isLoading } = useLogs();
  if (isLoading) return <div>Loading logs...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Logs</h1>
      <div className="grid gap-3">
        {logs.map((log: { id: string; level: string; source: string; message: string; createdAt: string }) => (
          <Card key={log.id}>
            <CardTitle>{log.level} - {log.source}</CardTitle>
            <CardContent className="space-y-1">
              <div>{log.message}</div>
              <div className="text-xs text-zinc-500">{new Date(log.createdAt).toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
