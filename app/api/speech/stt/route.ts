import { sarvamConfigured, transcribeHindi } from "@/lib/sarvam";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8_000_000;

export async function POST(request: Request) {
  if (!sarvamConfigured()) {
    return Response.json({ transcript: null, configured: false }, { status: 503 });
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "audio file expected" }, { status: 400 });
  }
  const file = form.get("file") ?? form.get("audio");
  if (!(file instanceof Blob) || file.size === 0) {
    return Response.json({ error: "audio file expected" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "audio too large" }, { status: 413 });
  }
  const filename = file instanceof File && file.name ? file.name : "speech.webm";
  const transcript = await transcribeHindi(file, filename);
  if (!transcript) return Response.json({ transcript: null, configured: true }, { status: 502 });
  return Response.json({ transcript, configured: true });
}
