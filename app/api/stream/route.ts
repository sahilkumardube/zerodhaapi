import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = async () => {
        const [positions, orders, risk, strategy] = await Promise.all([
          prisma.position.findMany({
            where: { status: "OPEN" },
            orderBy: { updatedAt: "desc" },
            take: 20,
            select: {
              id: true,
              symbol: true,
              legType: true,
              ltp: true,
              slPrice: true,
              unrealizedPnl: true,
              status: true,
              updatedAt: true,
            },
          }),
          prisma.order.findMany({
            orderBy: { createdAt: "desc" },
            take: 20,
            select: {
              id: true,
              brokerOrderId: true,
              side: true,
              status: true,
              createdAt: true,
            },
          }),
          prisma.riskSnapshot.findFirst({
            orderBy: { createdAt: "desc" },
            select: {
              totalPnl: true,
              totalRealized: true,
              totalUnrealized: true,
              maxLoss: true,
              createdAt: true,
            },
          }),
          prisma.strategyRun.findFirst({
            orderBy: { updatedAt: "desc" },
            select: {
              status: true,
              riskLocked: true,
              lockReason: true,
              niftyTrades: true,
              sensexTrades: true,
              updatedAt: true,
            },
          }),
        ]);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ positions, orders, risk, strategy })}\n\n`),
        );
      };

      await send();
      const id = setInterval(send, 3000);
      const keepAlive = setInterval(() => controller.enqueue(encoder.encode(":\n\n")), 15000);

      return () => {
        clearInterval(id);
        clearInterval(keepAlive);
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
