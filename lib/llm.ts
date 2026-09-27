import type { Answer } from "./types";
import { getScheme } from "./schemes";
import { geminiGenerate, geminiConfigured } from "./gemini";
import { fetchWithTimeout } from "./http";
import { LOW_LINE_HI } from "./engine";

export function activeModel(): "local" | "gemini" | "openai" {
  if (geminiConfigured()) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "local";
}

export async function maybeRewrite(
  answer: Answer,
  message: string,
  options?: { timeoutMs?: number },
): Promise<Answer> {
  const mode = activeModel();
  if (mode === "local") return answer;
  try {
    const text = mode === "gemini" ? await geminiRewrite(answer, message, options?.timeoutMs) : await openai(answer, message, options?.timeoutMs);
    if (!text) return answer;
    let withLinks = ensureCitations(plainProse(text), answer);
    if (answer.lowConfidence && !withLinks.includes("पक्का नहीं")) {
      withLinks = `${withLinks}\n\n${LOW_LINE_HI}`;
    }
    return {
      ...answer,
      answerHi: withLinks,
      mode,
    };
  } catch {
    return answer;
  }
}

function contextBlock(answer: Answer, message: string): string {
  const records = answer.schemes.map((match) => {
    const scheme = getScheme(match.schemeId);
    return {
      id: match.schemeId,
      status: match.status,
      reasonHi: match.reasonsHi[0],
      nameHi: scheme?.nameHi,
      summaryHi: scheme?.summaryHi,
      benefitHi: scheme?.benefitHi,
      officialUrl: scheme?.officialUrl,
      helpline: scheme?.helpline,
    };
  });
  return [
    "You are Sarkari Saathi. Answer in simple spoken Hindi.",
    "End each Hindi sentence with । and not a Latin full stop.",
    "Use ONLY the records below. Do not invent amounts, ages, or eligibility.",
    "Keep every official URL that belongs to a scheme you name.",
    "If status is eligible, say the person is पात्र. Use करीब only when status is likely. If status is unknown, ask for the missing facts.",
    "If the records are not enough, say you are not sure and tell the person to verify with the official helpline or office.",
    "Do not say that an application was submitted.",
    "Do not contradict the status field.",
    "Do not use markdown bold.",
    "Stay under 180 words.",
    "",
    `USER: ${message}`,
    `PROFILE: ${JSON.stringify(answer.profile)}`,
    `RECORDS: ${JSON.stringify(records)}`,
    `LOCAL_DRAFT: ${answer.answerHi}`,
  ].join("\n");
}

async function geminiRewrite(answer: Answer, message: string, timeoutMs = 12000): Promise<string | null> {
  return geminiGenerate(contextBlock(answer, message), { timeoutMs, temperature: 0.2, maxOutputTokens: 2048 });
}

function plainProse(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/__([^_]+)__/g, "$1");
}

async function openai(answer: Answer, message: string, timeoutMs = 12000): Promise<string | null> {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const response = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: "You write careful Hindi answers grounded only in the user's records." },
        { role: "user", content: contextBlock(answer, message) },
      ],
    }),
  }, timeoutMs);
  if (!response.ok) {
    await response.body?.cancel();
    return null;
  }
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

function ensureCitations(text: string, answer: Answer): string {
  const missing = answer.citations.filter((citation) => !text.includes(citation.url));
  if (missing.length === 0) return text;
  const tail = missing.map((citation) => `${citation.title}: ${citation.url}`).join("\n");
  return `${text}\n\nस्रोत:\n${tail}`;
}
