import { answerQuestion } from "@/lib/engine";
import { maybeRewrite } from "@/lib/llm";
import type { Profile } from "@/lib/types";

export async function POST(request: Request) {
  let body: { message?: string; profile?: Profile };
  try {
    body = (await request.json()) as { message?: string; profile?: Profile };
  } catch {
    return Response.json({ error: "JSON body expected." }, { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message.slice(0, 2000) : "";
  const local = answerQuestion({ message, profile: body.profile });
  const answer = await maybeRewrite(local, message);
  return Response.json(answer);
}
