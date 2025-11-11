import crypto from "crypto";

export function randomShortCodeNode(length = 6) {
  const buf = crypto.randomBytes(length);
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let s = "";
  for (let i = 0; i < length; i++) s += alphabet[(buf[i] ?? 0) % alphabet.length];
  return s;
}
