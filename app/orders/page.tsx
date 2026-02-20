"use client";

import { useOrders } from "@/hooks/use-trading-data";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useOrders();
  if (isLoading) return <div>Loading orders...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Orders</h1>
      <div className="grid gap-3">
        {orders.map(
          (o: {
            id: string;
            brokerOrderId: string;
            side: string;
            status: string;
            orderType: string;
            quantity: number;
            createdAt: string;
          }) => (
            <Card key={o.id}>
              <CardTitle>Order {o.brokerOrderId ?? o.id}</CardTitle>
              <CardContent className="grid grid-cols-2 gap-2 md:grid-cols-6">
                <div>Side: {o.side}</div>
                <div>Status: {o.status}</div>
                <div>Type: {o.orderType}</div>
                <div>Qty: {o.quantity}</div>
                <div>Time: {new Date(o.createdAt).toLocaleTimeString()}</div>
              </CardContent>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}
