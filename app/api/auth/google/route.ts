import { env } from "cloudflare:workers";
import { createSession, sessionCookie } from "../session";

export async function POST(request: Request) {
  const { credential } = await request.json() as { credential?: string };
  if (!credential) return Response.json({ error: "Google kimliği alınamadı." }, { status: 400 });
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  if (!response.ok) return Response.json({ error: "Google doğrulaması başarısız." }, { status: 401 });
  const profile = await response.json() as { aud?: string; email?: string; name?: string; email_verified?: string };
  const clientId = String((env as unknown as Record<string, unknown>).GOOGLE_CLIENT_ID ?? "");
  if (profile.aud !== clientId || profile.email_verified !== "true") return Response.json({ error: "Google hesabı doğrulanamadı." }, { status: 401 });
  const token = await createSession({ role: "teacher", name: profile.name || "Öğretmen", username: profile.email, email: profile.email });
  return Response.json({ role: "teacher", name: profile.name || "Öğretmen" }, { headers: { "Set-Cookie": sessionCookie(token) } });
}
