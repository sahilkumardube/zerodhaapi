import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/http";

export async function POST() {
  await prisma.authToken.deleteMany({ where: { broker: "ZERODHA" } });
  return jsonOk({ loggedOut: true });
}
