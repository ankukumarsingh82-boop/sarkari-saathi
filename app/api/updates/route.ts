import { searchOfficialUpdates } from "@/lib/official-updates";
import { getScheme } from "@/lib/schemes";

export const dynamic = "force-dynamic";

const NOTE_HI = "मुख्य स्रोत ऊपर दिया गया योजना रिकॉर्ड है। ये लिंक हाल की आधिकारिक जानकारी हैं।";

export async function POST(request: Request) {
  const configured = Boolean(process.env.FIRECRAWL_API_KEY);
  if (!configured) {
    return Response.json({ updates: [], configured: false, noteHi: NOTE_HI });
  }
  let body: { schemeIds?: unknown };
  try {
    body = (await request.json()) as { schemeIds?: unknown };
  } catch {
    return Response.json({ error: "JSON body expected." }, { status: 400 });
  }
  const schemeIds = Array.isArray(body.schemeIds)
    ? body.schemeIds.filter((id): id is string => typeof id === "string" && Boolean(getScheme(id))).slice(0, 3)
    : [];
  const updates = await searchOfficialUpdates(schemeIds);
  return Response.json({
    updates: updates.map((item) => ({ title: item.title, url: item.url })),
    configured: true,
    noteHi: NOTE_HI,
  });
}
