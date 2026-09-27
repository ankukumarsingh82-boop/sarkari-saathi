import assert from "node:assert/strict";
import test from "node:test";
import { answerQuestion } from "../lib/engine";
import { extractProfile } from "../lib/extract";
import { respondToMessage } from "../lib/respond";
import { acceptModelProfile, maybeFillProfile, messageNeedsUnderstanding } from "../lib/understand";
import { stalledFetch, withEnv } from "./helpers";

const messy = "main kisan hoon, zameen do acre hai, bank account hai, ITR jama karta hoon, pachas saal ka hoon, lady hoon, jhuggi mein rehta hoon";

test("plain digit profiles do not call the model", () => {
  const message = "मैं उत्तर प्रदेश का किसान हूँ। उम्र 42 साल। 2 एकड़ ज़मीन है। बैंक खाता है।";
  assert.equal(messageNeedsUnderstanding(message, extractProfile(message)), false);
});

test("model slots are accepted only when the quote is in the message", () => {
  const known = extractProfile(messy);
  assert.equal(known.paysIncomeTax, undefined);
  assert.equal(known.landAcres, undefined);
  assert.equal(known.age, undefined);
  assert.equal(known.gender, undefined);
  assert.equal(known.hasPuccaHouse, undefined);
  const filled = acceptModelProfile(messy, known, {
    age: 50,
    gender: "female",
    landAcres: 2,
    paysIncomeTax: true,
    hasPuccaHouse: false,
    state: "Bihar",
    evidence: {
      age: "pachas saal",
      gender: "lady",
      landAcres: "do acre",
      paysIncomeTax: "ITR jama karta hoon",
      hasPuccaHouse: "jhuggi",
      state: "Bihar",
    },
  });
  assert.equal(filled.age, 50);
  assert.equal(filled.gender, "female");
  assert.equal(filled.landAcres, 2);
  assert.equal(filled.paysIncomeTax, true);
  assert.equal(filled.hasPuccaHouse, false);
  assert.equal(filled.state, undefined);
});

test("ungrounded or conflicting model fields are dropped", () => {
  const known = extractProfile("main kisan hoon, tax nahi bharta, umar 42");
  assert.equal(known.paysIncomeTax, false);
  const filled = acceptModelProfile("main kisan hoon, tax nahi bharta, umar 42", known, {
    age: 90,
    paysIncomeTax: true,
    landAcres: 9,
    evidence: {
      age: "not in the message",
      paysIncomeTax: "tax nahi",
      landAcres: "do acre",
    },
  });
  assert.deepEqual(filled, {});
});

test("a daughter's age is not copied onto the speaker", () => {
  const message = "meri beti 6 saal ki hai, sukanya samriddhi account";
  const filled = acceptModelProfile(message, extractProfile(message), {
    age: 6,
    evidence: { age: "beti 6 saal" },
  });
  assert.equal(filled.age, undefined);
});

test("gemini slot fill feeds the rules engine and falls back on failure", async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  await withEnv({ GEMINI_API_KEY: "AQ.test", OPENAI_API_KEY: undefined, GEMINI_MODEL: undefined }, async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      age: 50,
                      gender: "female",
                      landAcres: 2,
                      paysIncomeTax: true,
                      hasPuccaHouse: false,
                      state: null,
                      evidence: {
                        age: "pachas saal",
                        gender: "lady",
                        landAcres: "do acre",
                        paysIncomeTax: "ITR jama karta hoon",
                        hasPuccaHouse: "jhuggi",
                        state: "",
                      },
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200 },
      )) as typeof fetch;

    const answer = await respondToMessage({ message: messy });
    assert.equal(answer.profile.age, 50);
    assert.equal(answer.profile.gender, "female");
    assert.equal(answer.profile.landAcres, 2);
    assert.equal(answer.profile.paysIncomeTax, true);
    assert.equal(answer.profile.hasPuccaHouse, false);
    assert.equal(answer.schemes.find((item) => item.schemeId === "pm-kisan")?.status, "ineligible");

    globalThis.fetch = stalledFetch as typeof fetch;
    const timedOut = await maybeFillProfile(messy, extractProfile(messy), { timeoutMs: 30 });
    assert.deepEqual(timedOut, {});

    globalThis.fetch = (async () => new Response("nope", { status: 500 })) as typeof fetch;
    assert.deepEqual(await maybeFillProfile(messy, extractProfile(messy)), {});

    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "not-json" }] } }] }), { status: 200 })) as typeof fetch;
    assert.deepEqual(await maybeFillProfile(messy, extractProfile(messy)), {});
  });
});

test("keyless respond matches the rules engine", async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  await withEnv({ GEMINI_API_KEY: undefined, OPENAI_API_KEY: undefined }, async () => {
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      throw new Error("network");
    }) as typeof fetch;
    const message = "mujhe kisaan ke liye kaunsi yojana milegi? main UP ka farmer hoon, umar 42, 2 acre, bank account hai";
    const via = await respondToMessage({ message });
    const direct = answerQuestion({ message });
    assert.equal(called, false);
    assert.equal(via.answerHi, direct.answerHi);
    assert.deepEqual(via.schemes, direct.schemes);
    assert.equal(via.mode, "local");
    assert.equal(via.lowConfidence, direct.lowConfidence);
  });
});
