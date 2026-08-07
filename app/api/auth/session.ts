import { env } from "cloudflare:workers";

type SessionPayload = { role: "admin" | "teacher" | "student"; name: string; email?: string; exp: number };

function base64Url(value: string | ArrayBuffer) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signature(payload: string) {
  const secret = String((env as unknown as Record<string, unknown>).SESSION_SECRET ?? "");
  if (!secret) throw new Error("SESSION_SECRET is missing");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
}

export async function createSession(payload: Omit<SessionPayload, "exp">) {
  const body = base64Url(JSON.stringify({ ...payload, exp: Date.now() + 1000 * 60 * 60 * 12 }));
  return `${body}.${await signature(body)}`;
}

export async function readSession(request: Request): Promise<SessionPayload | null> {
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith("modai_session="))?.slice(14);
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig || sig !== await signature(body)) return null;
  try {
    const normalized = body.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(Array.from(atob(normalized), (char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join(""));
    const payload = JSON.parse(json) as SessionPayload;
    return payload.exp > Date.now() ? payload : null;
  } catch { return null; }
}

export function sessionCookie(token: string) {
  return `modai_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`;
}

export function clearSessionCookie() {
  return "modai_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
}
