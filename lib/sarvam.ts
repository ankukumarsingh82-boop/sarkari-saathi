import { fetchWithTimeout } from "./http";

export const SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text";
export const SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech";
export const BULBUL_V3_LIMIT = 2500;
export const BULBUL_V2_LIMIT = 1500;

export function sarvamConfigured(): boolean {
  return Boolean(process.env.SARVAM_API_KEY);
}

export function sttModel(): string {
  return process.env.SARVAM_STT_MODEL || "saaras:v3";
}

export function ttsModel(): string {
  return process.env.SARVAM_TTS_MODEL || "bulbul:v3";
}

export function ttsSpeaker(): string {
  return process.env.SARVAM_TTS_SPEAKER || "shubh";
}

export function ttsCharLimit(model = ttsModel()): number {
  return model.startsWith("bulbul:v2") ? BULBUL_V2_LIMIT : BULBUL_V3_LIMIT;
}

export function chunkSpeechText(text: string, limit = ttsCharLimit() - 100): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const max = Math.max(1, limit);
  if (clean.length <= max) return [clean];
  const chunks: string[] = [];
  let rest = clean;
  while (rest.length > max && chunks.length < 5) {
    const window = rest.slice(0, max);
    let breakAt = -1;
    for (const mark of ["।", "?", "!", ".", " "]) {
      const at = window.lastIndexOf(mark);
      if (at > breakAt) breakAt = at;
    }
    const cut = breakAt > max * 0.5 ? breakAt + 1 : max;
    const piece = rest.slice(0, cut).trim();
    if (piece) chunks.push(piece);
    rest = rest.slice(cut).trim();
  }
  if (rest && chunks.length < 6) chunks.push(rest.slice(0, max));
  return chunks;
}

export async function transcribeHindi(
  audio: Blob,
  filename = "speech.webm",
  timeoutMs = 20000,
): Promise<string | null> {
  const key = process.env.SARVAM_API_KEY;
  if (!key || audio.size === 0) return null;
  const form = new FormData();
  form.append("file", audio, filename);
  const model = sttModel();
  form.append("model", model);
  form.append("language_code", "hi-IN");
  if (model.startsWith("saaras")) form.append("mode", "transcribe");
  try {
    const response = await fetchWithTimeout(
      SARVAM_STT_URL,
      {
        method: "POST",
        headers: { "api-subscription-key": key },
        body: form,
      },
      timeoutMs,
    );
    if (!response.ok) {
      await response.body?.cancel();
      return null;
    }
    const data = (await response.json()) as { transcript?: string };
    const transcript = data.transcript?.trim();
    return transcript || null;
  } catch {
    return null;
  }
}

async function synthesizeChunk(text: string, timeoutMs: number): Promise<string[] | null> {
  const key = process.env.SARVAM_API_KEY;
  if (!key) return null;
  const model = ttsModel();
  const body: Record<string, unknown> = {
    text,
    language_code: "hi-IN",
    model,
    speaker: ttsSpeaker(),
    pace: 1,
    output_audio_codec: "wav",
    speech_sample_rate: 24000,
  };
  if (model.startsWith("bulbul:v3")) body.temperature = 0.6;
  try {
    const response = await fetchWithTimeout(
      SARVAM_TTS_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": key,
        },
        body: JSON.stringify(body),
      },
      timeoutMs,
    );
    if (!response.ok) {
      await response.body?.cancel();
      return null;
    }
    const data = (await response.json()) as { audios?: string[] };
    const audios = (data.audios ?? []).filter((item) => typeof item === "string" && item.length > 0);
    return audios.length ? audios : null;
  } catch {
    return null;
  }
}

export async function synthesizeHindi(text: string, timeoutMs = 12000): Promise<string[] | null> {
  if (!sarvamConfigured()) return null;
  const chunks = chunkSpeechText(text);
  if (chunks.length === 0) return null;
  const audios: string[] = [];
  for (const chunk of chunks) {
    const part = await synthesizeChunk(chunk, timeoutMs);
    if (!part) return null;
    audios.push(...part);
  }
  return audios;
}
