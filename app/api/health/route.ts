import { activeModel } from "@/lib/llm";
import { geminiConfigured } from "@/lib/gemini";
import { sarvamConfigured } from "@/lib/sarvam";

export const dynamic = "force-dynamic";

export async function GET() {
  const mode = activeModel();
  return Response.json({
    ok: true,
    service: "sarkari-saathi",
    mode,
    keyless: mode === "local",
    gemini: geminiConfigured(),
    sarvam: sarvamConfigured(),
    search: Boolean(process.env.FIRECRAWL_API_KEY),
  });
}
