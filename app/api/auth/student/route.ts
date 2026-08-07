import { env } from "cloudflare:workers";
import { createSession, sessionCookie } from "../session";

export async function POST(request: Request) {
  const { username, password } = await request.json() as { username?: string; password?: string };
  const values = env as unknown as Record<string, unknown>;
  if ((username ?? "").trim() !== String(values.DEMO_STUDENT_USERNAME ?? "") || password !== String(values.DEMO_STUDENT_PASSWORD ?? "")) {
    return Response.json({ error: "Öğrenci kullanıcı adı veya şifresi hatalı." }, { status: 401 });
  }
  const token = await createSession({ role: "student", name: "Ece Yılmaz" });
  return Response.json({ role: "student", name: "Ece Yılmaz" }, { headers: { "Set-Cookie": sessionCookie(token) } });
}
