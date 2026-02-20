import type { OrderSide } from "@prisma/client";
import { prisma } from "@/lib/db";
import { placeOrder } from "@/services/zerodha/kite-client";
import { logEvent } from "@/services/logger.service";

type PlaceLegInput = {
  accessToken: string;
  tradeId: string;
  positionId: string;
  exchange: string;
  tradingsymbol: string;
  quantity: number;
  side: OrderSide;
  orderType?: "MARKET" | "LIMIT" | "SL" | "SL-M";
  price?: number;
  triggerPrice?: number;
};

export async function placeLegOrderWithRetry(input: PlaceLegInput) {
  const maxRetries = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await placeOrder(input.accessToken, {
        exchange: input.exchange,
        tradingsymbol: input.tradingsymbol,
        transaction_type: input.side,
        quantity: input.quantity,
        order_type: input.orderType ?? "MARKET",
        product: "MIS",
        variety: "regular",
        price: input.price,
        trigger_price: input.triggerPrice,
      });

      await prisma.order.create({
        data: {
          brokerOrderId: response.order_id,
          tradeId: input.tradeId,
          positionId: input.positionId,
          side: input.side,
          orderType: input.orderType ?? "MARKET",
          quantity: input.quantity,
          price: input.price,
          triggerPrice: input.triggerPrice,
          status: "PENDING",
          retries: attempt - 1,
          requestPayload: input,
          responsePayload: response,
        },
      });
      return response;
    } catch (error) {
      lastError = error;
      await logEvent("WARN", "order-execution", "Order attempt failed", {
        attempt,
        tradingsymbol: input.tradingsymbol,
      });
      await prisma.order.create({
        data: {
          tradeId: input.tradeId,
          positionId: input.positionId,
          side: input.side,
          orderType: input.orderType ?? "MARKET",
          quantity: input.quantity,
          price: input.price,
          triggerPrice: input.triggerPrice,
          status: "REJECTED",
          retries: attempt,
          requestPayload: input,
          responsePayload: { error: String(error) },
        },
      });
    }
  }

  throw new Error(`Order failed after retries: ${String(lastError)}`);
}
