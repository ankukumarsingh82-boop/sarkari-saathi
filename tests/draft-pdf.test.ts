import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PDFDocument } from "pdf-lib";
import { draftLines } from "../lib/draft";
import { buildDraftPdf } from "../lib/draft-pdf";

test("a full confirmed draft fits on one page of selectable text", async () => {
  const lines = draftLines({
    confirmed: true,
    applicantName: "राम कुमार",
    schemeId: "pm-kisan",
    profile: {
      name: "राम कुमार",
      age: 42,
      gender: "male",
      state: "Uttar Pradesh",
      area: "rural",
      occupation: "farmer",
      category: "obc",
      annualIncome: 80000,
      landAcres: 2,
      hasBankAccount: true,
      isBpl: false,
      paysIncomeTax: false,
      hasPuccaHouse: false,
      hasGirlChildUnder10: false,
      isPregnant: false,
    },
    aadhaarLast4: "1234",
  });
  const font = readFileSync(new URL("../public/fonts/NotoSansDevanagari-Regular.ttf", import.meta.url));
  const bytes = await buildDraftPdf(new Uint8Array(font), lines);
  const doc = await PDFDocument.load(bytes);
  assert.equal(doc.getPageCount(), 1);
  const raw = Buffer.from(bytes).toString("latin1");
  assert.match(raw, /TJ|Tj/);
  assert.doesNotMatch(raw, /\/Subtype \/Image/);
});
