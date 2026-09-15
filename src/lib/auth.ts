/**
 * Autenticación mínima: un único PIN compartido (variable de entorno APP_PIN),
 * sin usuarios ni registro. La sesión es una cookie httpOnly firmada con HMAC-SHA256
 * usando Web Crypto, para que funcione tanto en Server Actions/rutas Node como en
 * el middleware (Edge runtime).
 */

export const SESSION_COOKIE_NAME = "fpd_session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 días

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Falta configurar SESSION_SECRET en las variables de entorno.");
  }
  return secret;
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return bytesToBase64Url(sig);
}

export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  const secret = getSessionSecret();
  const signature = await hmacSign(payload, secret);
  return `${payload}.${signature}`;
}

export async function isValidSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  try {
    const secret = getSessionSecret();
    const expected = await hmacSign(payload, secret);
    return expected === signature;
  } catch {
    return false;
  }
}

export function checkPin(candidate: string): boolean {
  const expected = process.env.APP_PIN;
  if (!expected) {
    throw new Error("Falta configurar APP_PIN en las variables de entorno.");
  }
  if (candidate.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= candidate.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}
