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
  const validUser = String(values.TEACHER_USERNAME ?? "") === (username ?? "").trim();
  const validPassword = equal(await digest(password ?? ""), await digest(String(values.TEACHER_PASSWORD ?? "")));
  if (!validUser || !validPassword) return Response.json({ error: "Kullanıcı adı veya şifre hatalı." }, { status: 401 });
  const token = await createSession({ role: "teacher", name: "Seda Hoca", username: (username ?? "").trim() });
  return Response.json({ role: "teacher", name: "Seda Hoca" }, { headers: { "Set-Cookie": sessionCookie(token) } });
}
