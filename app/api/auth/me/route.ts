import { readSession } from "../session";

export async function GET(request: Request) {
  const session = await readSession(request);
  return session ? Response.json(session) : Response.json({ role: null }, { status: 401 });
}
