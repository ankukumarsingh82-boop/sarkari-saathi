import assert from "node:assert/strict";
import test from "node:test";
import { answerQuestion } from "../lib/engine";
import { isNewQuestion, profileForTurn, sessionAfterAnswer } from "../lib/context";

const farmerChat = {
  age: 42,
  state: "Uttar Pradesh",
  occupation: "farmer" as const,
  landAcres: 2,
  hasBankAccount: true,
};

test("a new housing question drops stale chat fields and keeps the form", () => {
  const message = "गाँव में कच्चा मकान है, आवास योजना";
  assert.equal(isNewQuestion(message), true);
  const sent = profileForTurn(message, { state: "Bihar" }, farmerChat);
  assert.equal(sent.state, "Bihar");
  assert.equal(sent.occupation, undefined);
  assert.equal(sent.landAcres, undefined);
  assert.equal(sent.hasPuccaHouse, undefined);

  const answer = answerQuestion({ message, profile: sent });
  assert.equal(answer.profile.occupation, undefined);
  assert.equal(answer.profile.hasPuccaHouse, false);
  assert.equal(answer.schemes[0]?.schemeId, "pmay-g");
  assert.notEqual(answer.schemes.find((item) => item.schemeId === "pm-kisan")?.status, "eligible");
  const session = sessionAfterAnswer({ state: "Bihar" }, answer.profile);
  assert.equal(session.occupation, undefined);
  assert.equal(session.hasPuccaHouse, false);
  assert.equal(session.state, undefined);
});

test("a short follow-up keeps the chat profile", () => {
  assert.equal(isNewQuestion("2 एकड़"), false);
  assert.equal(isNewQuestion("उम्र 42 साल"), false);
  const sent = profileForTurn("2 एकड़", {}, { occupation: "farmer", age: 42 });
  assert.equal(sent.occupation, "farmer");
  assert.equal(sent.age, 42);
  const answer = answerQuestion({ message: "2 एकड़", profile: sent });
  assert.equal(answer.profile.occupation, "farmer");
  assert.equal(answer.profile.landAcres, 2);
});
