import { fetchWithTimeout } from "./http";

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export function geminiModel(): string {
  return process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
}

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

interface GeminiPart {
  text?: string;
  thought?: boolean;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
}

export async function geminiGenerate(
  prompt: string,
  options?: {
    timeoutMs?: number;
    temperature?: number;
    maxOutputTokens?: number;
    json?: boolean;
  },
): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = geminiModel();
  const timeoutMs = options?.timeoutMs ?? 12000;
  const generationConfig: Record<string, unknown> = {
    temperature: options?.temperature ?? 0.2,
    maxOutputTokens: options?.maxOutputTokens ?? 1024,
  };
  if (options?.json) generationConfig.responseMimeType = "application/json";
  if (model.includes("2.5")) generationConfig.thinkingConfig = { thinkingBudget: 0 };

  try {
    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig,
        }),
      },
      timeoutMs,
    );
    if (!response.ok) {
      await response.body?.cancel();
      return null;
    }
    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts
      ?.filter((part) => !part.thought)
      .map((part) => part.text ?? "")
      .join("")
      .trim();
    return text || null;
  } catch {
    return null;
  }
}
