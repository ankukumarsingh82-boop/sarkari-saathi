import { sarvamConfigured, synthesizeHindi } from "@/lib/sarvam";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sarvamConfigured()) {
    return Response.json({ audios: [], configured: false }, { status: 503 });
  }
  let body: { text?: string };
  try {
    body = (await request.json()) as { text?: string };
  } catch {
    return Response.json({ error: "JSON body expected." }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.slice(0, 8000).trim() : "";
  if (!text) return Response.json({ error: "text expected" }, { status: 400 });
  const audios = await synthesizeHindi(text);
  if (!audios) return Response.json({ audios: [], configured: true }, { status: 502 });
  return Response.json({ audios, mime: "audio/wav", configured: true });
}
