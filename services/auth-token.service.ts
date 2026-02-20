import { prisma } from "@/lib/db";
import { decryptString, encryptString } from "@/lib/crypto";

type TokenPayload = {
  accessToken: string;
  userId?: string;
  loginTime?: string;
};

export async function saveAccessToken(payload: TokenPayload) {
  const encryptedData = encryptString(JSON.stringify(payload));
  await prisma.authToken.create({
    data: {
      broker: "ZERODHA",
      userId: payload.userId,
      encryptedData,
    },
  });
}

export async function getLatestAccessToken() {
  const latest = await prisma.authToken.findFirst({
    where: { broker: "ZERODHA" },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) return null;
  const decrypted = decryptString(latest.encryptedData);
  return JSON.parse(decrypted) as TokenPayload;
}
