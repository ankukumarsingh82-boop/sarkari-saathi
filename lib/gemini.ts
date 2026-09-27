import { fetchWithTimeout } from "./http";

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export function geminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

interface GeminiPart {
  text?: string;
  thought?: boolean;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
}

interface GeminiCall {
  ok: boolean;
  status: number;
  text: string | null;
  error: string;
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
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  const timeoutMs = options?.timeoutMs ?? 12000;
  const baseConfig: Record<string, unknown> = {
    temperature: options?.temperature ?? 0.2,
    maxOutputTokens: Math.max(1024, options?.maxOutputTokens ?? 2048),
  };
  if (options?.json) baseConfig.responseMimeType = "application/json";

  try {
    let model = geminiModel();
    const withThinking = thinkingConfig(model, baseConfig);
    let result = await request(model, key, prompt, withThinking, timeoutMs);
    if (shouldDropThinking(result, withThinking)) {
      console.error("gemini retry without thinkingConfig", result.status);
      result = await request(model, key, prompt, baseConfig, timeoutMs);
    }
    if (result.status === 404 && model !== DEFAULT_GEMINI_MODEL) {
      console.error("gemini retry default model", result.status);
      model = DEFAULT_GEMINI_MODEL;
      result = await request(model, key, prompt, thinkingConfig(model, baseConfig), timeoutMs);
    }
    if (!result.ok || !result.text) {
      if (!result.ok) console.error("gemini failed", result.status, redact(result.error, key));
      return null;
    }
    return result.text;
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed";
    console.error("gemini error", redact(message, key));
    return null;
  }
}

function thinkingConfig(model: string, baseConfig: Record<string, unknown>): Record<string, unknown> {
  if (!model.includes("2.5")) return baseConfig;
  return { ...baseConfig, thinkingConfig: { thinkingBudget: 0 } };
}

function shouldDropThinking(result: GeminiCall, config: Record<string, unknown>): boolean {
  if (!("thinkingConfig" in config)) return false;
  if (result.status === 401 || result.status === 403) return false;
  return result.status === 400 || (result.ok && !result.text);
}

async function request(
  model: string,
  key: string,
  prompt: string,
  generationConfig: Record<string, unknown>,
  timeoutMs: number,
): Promise<GeminiCall> {
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
    const error = await response.text();
    return { ok: false, status: response.status, text: null, error };
  }
  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts
    ?.filter((part) => !part.thought)
    .map((part) => part.text ?? "")
    .join("")
    .trim();
  return { ok: true, status: response.status, text: text || null, error: "" };
}

function redact(text: string, key: string): string {
  return text.split(key).join("[redacted]").slice(0, 240);
}
