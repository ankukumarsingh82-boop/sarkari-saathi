import assert from "node:assert/strict";
import test from "node:test";
import { canDownloadDraft, draftLines } from "../lib/draft";
import { evaluateScheme } from "../lib/eligibility";
import { answerQuestion } from "../lib/engine";
import { schemes } from "../lib/schemes";

test("knowledge base has 15 sourced schemes", () => {
  assert.equal(schemes.length, 15);
  for (const scheme of schemes) {
    assert.ok(scheme.summaryHi.length > 40);
    assert.ok(scheme.summaryEn.length > 40);
    assert.ok(scheme.officialUrl.startsWith("https://"));
    assert.ok(scheme.sourceUrl.startsWith("https://"));
    assert.equal(scheme.sourceCheckedOn, "2026-09-27");
    assert.ok(scheme.documentsHi.length >= 3);
    assert.ok(scheme.eligibilityHi.length >= 1);
  }
});

test("farmer with land is eligible for PM-KISAN and the answer cites the portal", () => {
  const answer = answerQuestion({
    message: "मैं उत्तर प्रदेश का किसान हूँ। उम्र 42 साल। 2 एकड़ ज़मीन है। बैंक खाता है।",
  });
  const match = answer.schemes.find((item) => item.schemeId === "pm-kisan");
  assert.equal(match?.status, "eligible");
  assert.match(answer.answerHi, /6,000/);
  assert.match(answer.answerHi, /pmkisan\.gov\.in/);
  assert.equal(answer.lowConfidence, false);
});

test("income tax payer is not eligible for PM-KISAN", () => {
  const rule = evaluateScheme("pm-kisan", {
    occupation: "farmer",
    landAcres: 3,
    paysIncomeTax: true,
    age: 45,
    hasBankAccount: true,
  });
  assert.equal(rule.status, "ineligible");
});

test("high income without a tax flag does not invent an income cap", () => {
  const rule = evaluateScheme("pm-kisan", {
    occupation: "farmer",
    landAcres: 4,
    annualIncome: 800000,
    age: 38,
    hasBankAccount: true,
  });
  assert.equal(rule.status, "eligible");
});

test("age gates", () => {
  assert.equal(evaluateScheme("apy", { age: 40, hasBankAccount: true, paysIncomeTax: false }).status, "eligible");
  assert.equal(evaluateScheme("apy", { age: 41, hasBankAccount: true }).status, "ineligible");
  assert.equal(evaluateScheme("pmjjby", { age: 50, hasBankAccount: true }).status, "eligible");
  assert.equal(evaluateScheme("pmjjby", { age: 51, hasBankAccount: true }).status, "ineligible");
  assert.equal(evaluateScheme("pmsby", { age: 70, hasBankAccount: true }).status, "eligible");
  assert.equal(evaluateScheme("pmsby", { age: 71, hasBankAccount: true }).status, "ineligible");
  assert.equal(evaluateScheme("ignoaps", { age: 59, isBpl: true }).status, "ineligible");
  assert.equal(evaluateScheme("ignoaps", { age: 60, isBpl: true }).status, "eligible");
  assert.equal(evaluateScheme("ignoaps", { age: 80, isBpl: true }).status, "eligible");
  assert.equal(evaluateScheme("ab-pmjay", { age: 70 }).status, "eligible");
  assert.equal(evaluateScheme("ab-pmjay", { age: 69, isBpl: false }).status, "unknown");
  assert.equal(evaluateScheme("eshram", { age: 16, occupation: "daily_wage" }).status, "likely");
  assert.equal(evaluateScheme("eshram", { age: 60, occupation: "daily_wage" }).status, "ineligible");
  assert.equal(evaluateScheme("ssy", { gender: "female", age: 9 }).status, "eligible");
  assert.equal(evaluateScheme("ssy", { gender: "female", age: 10, hasGirlChildUnder10: false }).status, "ineligible");
});

test("ujjwala requires a woman", () => {
  const answer = answerQuestion({ message: "मैं पुरुष हूँ, क्या उज्ज्वला मिलेगी? उम्र 30 साल" });
  const match = answer.schemes.find((item) => item.schemeId === "pmuy");
  assert.equal(match?.status, "ineligible");
  assert.equal(answer.lowConfidence, false);
  assert.match(answer.answerHi, /pmuy\.gov\.in/);
});

test("hinglish farmer query cites PM-KISAN", () => {
  const answer = answerQuestion({
    message: "mujhe kisaan ke liye kaunsi yojana milegi? main UP ka farmer hoon, umar 42, 2 acre, bank account hai",
  });
  assert.equal(answer.schemes.find((item) => item.schemeId === "pm-kisan")?.status, "eligible");
  assert.match(answer.answerHi, /pmkisan\.gov\.in/);
});

test("out of scope stays low confidence and names no scheme as eligible", () => {
  const answer = answerQuestion({ message: "aaj cricket ka score kya hai" });
  assert.equal(answer.outOfScope, true);
  assert.equal(answer.lowConfidence, true);
  assert.equal(answer.schemes.length, 0);
  assert.match(answer.answerHi, /पक्का नहीं है/);
});

test("daughter age is not treated as the applicant age", () => {
  const answer = answerQuestion({ message: "मेरी बेटी 6 साल की है, सुकन्या खाता खोलना है" });
  assert.equal(answer.profile.age, undefined);
  assert.equal(answer.profile.hasGirlChildUnder10, true);
  assert.equal(answer.schemes.find((item) => item.schemeId === "ssy")?.status, "eligible");
});

test("hindi status lines join with a danda", () => {
  const answer = answerQuestion({
    message: "मैं उत्तर प्रदेश का किसान हूँ। उम्र 42 साल। 2 एकड़ ज़मीन है। बैंक खाता है।",
  });
  assert.match(answer.answerHi, /करीब हैं। आप किसान/);
  assert.doesNotMatch(answer.answerHi, /[\u0900-\u097F]\./);
  assert.match(answer.answerEn, /close to this scheme\. You are a farmer/);
});

test("empty message asks the person to type or speak", () => {
  const answer = answerQuestion({ message: "   " });
  assert.equal(answer.needsInfo, true);
  assert.equal(answer.lowConfidence, false);
  assert.equal(answer.outOfScope, false);
  assert.equal(answer.schemes.length, 0);
  assert.match(answer.answerHi, /टाइप करें या माइक/);
  assert.doesNotMatch(answer.answerHi, /भरोसेमंद योजना नहीं है/);
});

test("draft download stays locked until confirmation", () => {
  assert.equal(canDownloadDraft({ confirmed: false, applicantName: "राम", schemeId: "pm-kisan" }), false);
  assert.equal(canDownloadDraft({ confirmed: true, applicantName: "र", schemeId: "pm-kisan" }), false);
  assert.equal(canDownloadDraft({ confirmed: true, applicantName: "राम कुमार", schemeId: "pm-kisan" }), true);
  const lines = draftLines({
    confirmed: true,
    applicantName: "राम कुमार",
    schemeId: "pm-kisan",
    profile: { age: 42, state: "Uttar Pradesh", occupation: "farmer" },
    aadhaarLast4: "1234",
  });
  assert.match(lines.join("\n"), /DRAFT ONLY/);
  assert.match(lines.join("\n"), /XXXX-XXXX-1234/);
  assert.match(lines.join("\n"), /जमा नहीं किया गया/);
});
