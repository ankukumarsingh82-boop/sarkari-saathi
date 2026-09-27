import { mergeProfiles } from "./extract";
import { bestScore, retrievalScores } from "./retrieve";
import type { Profile } from "./types";

const QUESTION =
  /योजन|yojana|scheme|कौन|kaun|चाहिए|chahiye|कैसे|kaise|मिलेग|mileg|मिल सक|mil sak|\?|what scheme|which scheme/i;

const STRONG_MATCH = 4;

export function isNewQuestion(message: string): boolean {
  const text = message.trim();
  if (!text) return true;
  if (QUESTION.test(text)) return true;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length > 10) return true;
  if (bestScore(retrievalScores(text)) >= STRONG_MATCH) return true;
  return false;
}

export function profileForTurn(message: string, formProfile: Profile = {}, sessionProfile: Profile = {}): Profile {
  if (isNewQuestion(message)) return { ...formProfile };
  return mergeProfiles(formProfile, sessionProfile);
}

export function sessionAfterAnswer(formProfile: Profile, combined: Profile): Profile {
  const session: Profile = {};
  for (const key of Object.keys(combined) as (keyof Profile)[]) {
    if (combined[key] !== undefined && formProfile[key] === undefined) {
      session[key] = combined[key] as never;
    }
  }
  return session;
}
