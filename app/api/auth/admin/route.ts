import { env } from "cloudflare:workers";
import { createSession, sessionCookie } from "../session";

async function digest(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

function equal(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a[i] ^ b[i];
  return result === 0;
}

export async function POST(request: Request) {
  const { username, password } = await request.json() as { username?: string; password?: string };
  const values = env as unknown as Record<string, unknown>;
  const validUser = String(values.ADMIN_USERNAME ?? "").toLocaleLowerCase("tr-TR") === (username ?? "").trim().toLocaleLowerCase("tr-TR");
  const validPassword = equal(await digest(password ?? ""), await digest(String(values.ADMIN_PASSWORD ?? "")));
  if (!validUser || !validPassword) return Response.json({ error: "Kullanıcı adı veya şifre hatalı." }, { status: 401 });
  const token = await createSession({ role: "admin", name: "Admin", username: "Admin" });
  return Response.json({ role: "admin", name: "Admin" }, { headers: { "Set-Cookie": sessionCookie(token) } });
}
