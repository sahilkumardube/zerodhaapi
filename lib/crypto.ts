import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

function getKey() {
  return createHash("sha256").update(env.APP_ENCRYPTION_KEY).digest();
}

export function encryptString(raw: string) {
  const iv = randomBytes(16);
  const key = getKey();
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(raw, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptString(payload: string) {
  const [ivHex, contentHex] = payload.split(":");
  if (!ivHex || !contentHex) {
    throw new Error("Invalid encrypted payload");
  }
  const iv = Buffer.from(ivHex, "hex");
  const content = Buffer.from(contentHex, "hex");
  const key = getKey();
  const decipher = createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([decipher.update(content), decipher.final()]);
  return decrypted.toString("utf8");
}
