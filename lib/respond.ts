import { answerQuestion } from "./engine";
import { extractProfile, mergeProfiles } from "./extract";
import { maybeRewrite } from "./llm";
import { maybeFillProfile } from "./understand";
import type { Answer, Profile } from "./types";

export async function respondToMessage(input: { message?: string; profile?: Profile }): Promise<Answer> {
  const message = typeof input.message === "string" ? input.message.slice(0, 2000) : "";
  const extracted = extractProfile(message);
  const filled = await maybeFillProfile(message, mergeProfiles(input.profile, extracted));
  const profile = mergeProfiles(mergeProfiles(input.profile, filled), extracted);
  const local = answerQuestion({ message, profile });
  return maybeRewrite(local, message);
}
