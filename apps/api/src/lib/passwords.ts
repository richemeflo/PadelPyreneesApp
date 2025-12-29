import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const SALT_BYTES = 16;
const KEY_LENGTH = 64;
const PREFIX = "scrypt";

export async function hashPassword(password: string) {
  const salt = randomBytes(SALT_BYTES);
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${PREFIX}$${salt.toString("base64")}$${derived.toString("base64")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [prefix, saltB64, hashB64] = storedHash.split("$");
  if (prefix !== PREFIX || !saltB64 || !hashB64) {
    return false;
  }

  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");
  const derived = (await scryptAsync(password, salt, expected.length)) as Buffer;

  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}
