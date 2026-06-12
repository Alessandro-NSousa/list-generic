import { randomBytes } from "node:crypto";

export function generatePublicToken() {
  return randomBytes(12).toString("hex");
}