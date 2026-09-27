import assert from "node:assert/strict";
import test from "node:test";
import { chunkSpeechText, synthesizeHindi, transcribeHindi } from "../lib/sarvam";
import { stalledFetch, withEnv } from "./helpers";

test("tts chunks stay inside the bulbul limit", () => {
  assert.deepEqual(chunkSpeechText(""), []);
  assert.deepEqual(chunkSpeechText("नमस्ते।"), ["नमस्ते।"]);
  const long = Array.from({ length: 12 }, () => "यह एक छोटी हिन्दी पंक्ति है।").join(" ");
  const chunks = chunkSpeechText(long, 80);
  assert.ok(chunks.length > 1);
  for (const chunk of chunks) assert.ok(chunk.length <= 80);
  assert.equal(chunks.join(" ").replace(/\s+/g, " ").includes("हिन्दी"), true);
});

test("stt posts saaras hindi audio and falls back on failure", async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  const audio = new Blob(["fake-audio"], { type: "audio/webm" });
  await withEnv({ SARVAM_API_KEY: undefined, SARVAM_STT_MODEL: undefined }, async () => {
    assert.equal(await transcribeHindi(audio), null);
  });
  await withEnv({ SARVAM_API_KEY: "sarvam-test", SARVAM_STT_MODEL: undefined }, async () => {
    let header = "";
    let model = "";
    let language = "";
    let mode = "";
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      header = new Headers(init?.headers).get("api-subscription-key") ?? "";
      const form = init?.body as FormData;
      model = String(form.get("model"));
      language = String(form.get("language_code"));
      mode = String(form.get("mode"));
      assert.equal(String(input), "https://api.sarvam.ai/speech-to-text");
      assert.ok(form.get("file"));
      return new Response(JSON.stringify({ transcript: "मुझे किसान योजना बताओ", language_code: "hi-IN" }), { status: 200 });
    }) as typeof fetch;
    assert.equal(await transcribeHindi(audio, "speech.webm"), "मुझे किसान योजना बताओ");
    assert.equal(header, "sarvam-test");
    assert.equal(model, "saaras:v3");
    assert.equal(language, "hi-IN");
    assert.equal(mode, "transcribe");

    globalThis.fetch = (async () => new Response("no", { status: 429 })) as typeof fetch;
    assert.equal(await transcribeHindi(audio), null);

    globalThis.fetch = stalledFetch as typeof fetch;
    assert.equal(await transcribeHindi(audio, "speech.webm", 30), null);
  });
  await withEnv({ SARVAM_API_KEY: "sarvam-test", SARVAM_STT_MODEL: "saarika:v2.5" }, async () => {
    let mode = "missing";
    globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      const form = init?.body as FormData;
      mode = form.get("mode") === null ? "missing" : String(form.get("mode"));
      assert.equal(form.get("model"), "saarika:v2.5");
      return new Response(JSON.stringify({ transcript: "नमस्ते" }), { status: 200 });
    }) as typeof fetch;
    assert.equal(await transcribeHindi(audio), "नमस्ते");
    assert.equal(mode, "missing");
  });
});

test("tts uses bulbul hindi audio and falls back when a chunk fails", async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  await withEnv({ SARVAM_API_KEY: undefined }, async () => {
    assert.equal(await synthesizeHindi("नमस्ते"), null);
  });
  await withEnv(
    { SARVAM_API_KEY: "sarvam-test", SARVAM_TTS_MODEL: undefined, SARVAM_TTS_SPEAKER: undefined },
    async () => {
      const bodies: string[] = [];
      globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        assert.equal(String(input), "https://api.sarvam.ai/text-to-speech");
        assert.equal(new Headers(init?.headers).get("api-subscription-key"), "sarvam-test");
        bodies.push(String(init?.body));
        return new Response(JSON.stringify({ audios: ["UklGRg=="] }), { status: 200 });
      }) as typeof fetch;
      const audios = await synthesizeHindi("नमस्ते, योजना सुनें।");
      assert.deepEqual(audios, ["UklGRg=="]);
      const payload = JSON.parse(bodies[0]) as { text: string; model: string; speaker: string; language_code: string };
      assert.equal(payload.model, "bulbul:v3");
      assert.equal(payload.speaker, "shubh");
      assert.equal(payload.language_code, "hi-IN");
      assert.equal(payload.text, "नमस्ते, योजना सुनें।");

      const long = "क".repeat(5000);
      bodies.length = 0;
      const parts = await synthesizeHindi(long);
      assert.ok(parts && parts.length >= 3);
      for (const raw of bodies) {
        const text = (JSON.parse(raw) as { text: string }).text;
        assert.ok(text.length <= 2400);
      }

      let calls = 0;
      globalThis.fetch = (async () => {
        calls += 1;
        if (calls === 1) return new Response(JSON.stringify({ audios: ["UklGRg=="] }), { status: 200 });
        return new Response("no", { status: 500 });
      }) as typeof fetch;
      assert.equal(await synthesizeHindi(long), null);

      globalThis.fetch = stalledFetch as typeof fetch;
      assert.equal(await synthesizeHindi("नमस्ते", 30), null);
    },
  );
});
