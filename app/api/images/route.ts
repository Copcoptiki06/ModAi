import { env } from "cloudflare:workers";
import { readSession } from "../auth/session";

function bucket() {
  const media = (env as unknown as { MEDIA?: R2Bucket }).MEDIA;
  if (!media) throw new Error("Görsel depolama alanı hazır değil.");
  return media;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (key) {
    const object = await bucket().get(key);
    if (!object) return new Response("Görsel bulunamadı", { status: 404 });
    return new Response(object.body, { headers: { "Content-Type": object.httpMetadata?.contentType || "image/webp", "Cache-Control": "public, max-age=86400" } });
  }
  const session = await readSession(request);
  if (!session || session.role !== "admin") return Response.json({ error: "Yetkisiz." }, { status: 403 });
  const list = await bucket().list({ limit: 100 });
  return Response.json({ images: list.objects.map(item => ({ key: item.key, url: `/api/images?key=${encodeURIComponent(item.key)}` })) });
}

export async function POST(request: Request) {
  const session = await readSession(request);
  if (!session || session.role !== "admin") return Response.json({ error: "Yetkisiz." }, { status: 403 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/") || file.size > 5_000_000) return Response.json({ error: "En fazla 5 MB PNG, JPG veya WebP görsel yükleyin." }, { status: 400 });
  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "webp";
  const key = `questions/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  await bucket().put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  return Response.json({ key, url: `/api/images?key=${encodeURIComponent(key)}` }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await readSession(request);
  if (!session || session.role !== "admin") return Response.json({ error: "Yetkisiz." }, { status: 403 });
  const key = new URL(request.url).searchParams.get("key");
  if (!key?.startsWith("questions/")) return Response.json({ error: "Geçersiz görsel." }, { status: 400 });
  await bucket().delete(key);
  return Response.json({ ok: true });
}
