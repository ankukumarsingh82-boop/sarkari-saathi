import { activeModel } from "@/lib/llm";

export async function GET() {
  return Response.json({
    ok: true,
    service: "sarkari-saathi",
    mode: activeModel(),
    keyless: activeModel() === "local",
  });
}
