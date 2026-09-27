import assert from "node:assert/strict";
import test from "node:test";
import { answerQuestion } from "../lib/engine";
import { activeModel, maybeRewrite } from "../lib/llm";
import { stalledFetch, withEnv } from "./helpers";

const farmer = () =>
  answerQuestion({
    message: "मैं उत्तर प्रदेश का किसान हूँ। उम्र 42 साल। 2 एकड़ ज़मीन है। बैंक खाता है।",
  });

test("gemini rewrite sends the key in a header and keeps the official URL", async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  await withEnv({ GEMINI_API_KEY: "AQ.not-an-aiza-key", GEMINI_MODEL: undefined, OPENAI_API_KEY: undefined }, async () => {
    assert.equal(activeModel(), "gemini");
    let seenUrl = "";
    let seenKey = "";
    let body = "";
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      seenUrl = String(input);
      seenKey = new Headers(init?.headers).get("x-goog-api-key") ?? "";
      body = String(init?.body ?? "");
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  { thought: true, text: "internal note that must not be shown" },
                  { text: "पीएम किसान से साल में 6,000 रुपये मिलते हैं।" },
                ],
              },
            },
          ],
        }),
        { status: 200 },
      );
    }) as typeof fetch;

    const local = farmer();
    const answer = await maybeRewrite(local, local.profile.state ?? "");
    assert.equal(answer.mode, "gemini");
    assert.equal(answer.schemes.find((item) => item.schemeId === "pm-kisan")?.status, "eligible");
    assert.equal(seenUrl, "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent");
    assert.equal(seenUrl.includes("AQ.not-an-aiza-key"), false);
    assert.equal(seenUrl.includes("key="), false);
    assert.equal(seenKey, "AQ.not-an-aiza-key");
    assert.match(body, /thinkingBudget/);
    assert.match(answer.answerHi, /pmkisan\.gov\.in/);
    assert.doesNotMatch(answer.answerHi, /internal note/);
  });
});

test("gemini failure and timeout keep the template answer", async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  await withEnv({ GEMINI_API_KEY: "AQ.test", OPENAI_API_KEY: undefined }, async () => {
    const local = farmer();
    globalThis.fetch = (async () => new Response("no", { status: 503 })) as typeof fetch;
    const failed = await maybeRewrite(local, "farmer");
    assert.equal(failed.answerHi, local.answerHi);
    assert.equal(failed.mode, "local");

    globalThis.fetch = stalledFetch as typeof fetch;
    const timedOut = await maybeRewrite(local, "farmer", { timeoutMs: 30 });
    assert.equal(timedOut.answerHi, local.answerHi);
    assert.equal(timedOut.mode, "local");
  });
});

test("missing keys stay on the local answer", async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  await withEnv({ GEMINI_API_KEY: undefined, OPENAI_API_KEY: undefined }, async () => {
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response("{}", { status: 200 });
    }) as typeof fetch;
    const local = farmer();
    const answer = await maybeRewrite(local, "farmer");
    assert.equal(called, false);
    assert.equal(answer, local);
    assert.equal(activeModel(), "local");
  });
});

test("openai is used only when gemini is unset", async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  await withEnv({ GEMINI_API_KEY: undefined, OPENAI_API_KEY: "sk-test", OPENAI_MODEL: undefined }, async () => {
    assert.equal(activeModel(), "openai");
    let auth = "";
    globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      auth = new Headers(init?.headers).get("authorization") ?? "";
      return new Response(JSON.stringify({ choices: [{ message: { content: "हिन्दी जवाब बिना लिंक।" } }] }), { status: 200 });
    }) as typeof fetch;
    const local = farmer();
    const answer = await maybeRewrite(local, "farmer");
    assert.equal(auth, "Bearer sk-test");
    assert.equal(answer.mode, "openai");
    assert.match(answer.answerHi, /pmkisan\.gov\.in/);
  });
});

test("a low-confidence rewrite keeps the verify line", async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  await withEnv({ GEMINI_API_KEY: "AQ.test", OPENAI_API_KEY: undefined }, async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({ candidates: [{ content: { parts: [{ text: "आवास योजना का नाम सरकारी सूची पर निर्भर है।" }] } }] }),
        { status: 200 },
      )) as typeof fetch;
    const local = answerQuestion({ message: "गाँव में कच्चा मकान है, आवास योजना" });
    assert.equal(local.lowConfidence, true);
    const answer = await maybeRewrite(local, "awas");
    assert.match(answer.answerHi, /पक्का नहीं है/);
    assert.equal(answer.schemes[0]?.status, local.schemes[0]?.status);
  });
});
