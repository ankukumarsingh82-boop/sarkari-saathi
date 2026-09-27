import type { Answer } from "./types";
import { getScheme } from "./schemes";

export function activeModel(): "local" | "gemini" | "openai" {
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "local";
}

export async function maybeRewrite(answer: Answer, message: string): Promise<Answer> {
  const mode = activeModel();
  if (mode === "local") return answer;
  try {
    const text = mode === "gemini" ? await gemini(answer, message) : await openai(answer, message);
    if (!text) return answer;
    const withLinks = ensureCitations(text, answer);
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
    "Use ONLY the records below. Do not invent amounts, ages, or eligibility.",
    "Keep every official URL that belongs to a scheme you name.",
    "If the records are not enough, say you are not sure and tell the person to verify with the official helpline or office.",
    "Do not say that an application was submitted.",
    "Do not contradict the status field.",
    "Stay under 180 words.",
    "",
    `USER: ${message}`,
    `PROFILE: ${JSON.stringify(answer.profile)}`,
    `RECORDS: ${JSON.stringify(records)}`,
    `LOCAL_DRAFT: ${answer.answerHi}`,
  ].join("\n");
}

async function gemini(answer: Answer, message: string): Promise<string | null> {
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const key = process.env.GEMINI_API_KEY as string;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: contextBlock(answer, message) }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 700 },
      }),
    },
  );
  if (!response.ok) return null;
  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  return text || null;
}

async function openai(answer: Answer, message: string): Promise<string | null> {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    signal: AbortSignal.timeout(12000),
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: "You write careful Hindi answers grounded only in the user's records." },
        { role: "user", content: contextBlock(answer, message) },
      ],
    }),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

function ensureCitations(text: string, answer: Answer): string {
  const missing = answer.citations.filter((citation) => !text.includes(citation.url));
  if (missing.length === 0) return text;
  const tail = missing.map((citation) => `${citation.title}: ${citation.url}`).join("\n");
  return `${text}\n\nस्रोत:\n${tail}`;
}
