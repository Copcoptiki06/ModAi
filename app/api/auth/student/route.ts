import { env } from "cloudflare:workers";
import { createSession, sessionCookie } from "../session";

export async function POST(request: Request) {
  const { username, password } = await request.json() as { username?: string; password?: string };
  const values = env as unknown as Record<string, unknown>;
  const cleanUsername = (username ?? "").trim();
  let studentName = "";
  if (cleanUsername === String(values.DEMO_STUDENT_USERNAME ?? "") && password === String(values.DEMO_STUDENT_PASSWORD ?? "")) studentName = "Ece Yılmaz";
  else if (env.DB) {
    const row = await env.DB.prepare("SELECT name,password_hash FROM users WHERE role='student' AND username=?").bind(cleanUsername).first<{name:string;password_hash:string}>();
    if (row) {
      const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password ?? "")));
      const candidate = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
      if (candidate === row.password_hash) studentName = row.name;
    }
  }
  if (!studentName) return Response.json({ error: "Öğrenci kullanıcı adı veya şifresi hatalı." }, { status: 401 });
  const token = await createSession({ role: "student", name: studentName, username: cleanUsername });
  return Response.json({ role: "student", name: studentName }, { headers: { "Set-Cookie": sessionCookie(token) } });
}
