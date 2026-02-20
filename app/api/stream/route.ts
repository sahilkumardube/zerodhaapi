import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = async () => {
        const [positions, orders, risk, strategy] = await Promise.all([
          prisma.position.findMany({ where: { status: "OPEN" }, orderBy: { updatedAt: "desc" } }),
          prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
          prisma.riskSnapshot.findFirst({ orderBy: { createdAt: "desc" } }),
          prisma.strategyRun.findFirst({ orderBy: { updatedAt: "desc" } }),
        ]);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ positions, orders, risk, strategy })}\n\n`),
        );
      };

      await send();
      const id = setInterval(send, 2000);
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
