import { respondToMessage } from "@/lib/respond";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { message?: string; profile?: Profile };
  try {
    body = (await request.json()) as { message?: string; profile?: Profile };
  } catch {
    return Response.json({ error: "JSON body expected." }, { status: 400 });
  }
  const answer = await respondToMessage({ message: body.message, profile: body.profile });
  return Response.json(answer);
}
