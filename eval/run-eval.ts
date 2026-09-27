import { writeFileSync } from "node:fs";
import { cases, personas } from "./cases";
import { answerQuestion } from "../lib/engine";
import { getScheme } from "../lib/schemes";

interface Row {
  id: string;
  pass: boolean;
  citation: boolean;
  lowConfidenceOk: boolean;
  missing: string[];
  unexpected: string[];
}

const rows: Row[] = cases.map((item) => {
  const answer = answerQuestion({ message: item.query, profile: item.profile });
  const positive = new Set(
    answer.schemes.filter((match) => match.status === "eligible" || match.status === "likely").map((match) => match.schemeId),
  );
  const missing = item.expectedSchemes.filter((id) => !positive.has(id));
  const unexpected = item.forbiddenSchemes.filter((id) => positive.has(id));
  const blob = `${answer.answerHi}\n${answer.answerEn}`;
  const citation = item.expectCitation
    ? item.expectedSchemes.length > 0
      ? item.expectedSchemes.every((id) => blob.includes(getScheme(id)?.officialUrl ?? "missing-url"))
      : blob.includes("http")
    : true;
  const lowConfidenceOk = answer.lowConfidence === item.expectLowConfidence;
  return {
    id: item.id,
    pass: missing.length === 0 && unexpected.length === 0,
    citation,
    lowConfidenceOk,
    missing,
    unexpected,
  };
});

const eligibilityAccuracy = rows.filter((row) => row.pass).length / rows.length;
const citationRows = cases.filter((item) => item.expectCitation);
const citationRate = rows.filter((row, index) => cases[index].expectCitation && row.citation).length / citationRows.length;
const lowConfidenceRate = rows.filter((row) => row.lowConfidenceOk).length / rows.length;
const hindi = cases.filter((item) => item.lang === "hi").length;
const hinglish = cases.filter((item) => item.lang === "hinglish").length;

const summary = {
  generatedOn: "2026-09-27",
  queries: cases.length,
  hindi,
  hinglish,
  personas: personas.length,
  eligibilityAccuracy: round(eligibilityAccuracy),
  citationRate: round(citationRate),
  lowConfidenceAgreement: round(lowConfidenceRate),
  eligibilityPasses: rows.filter((row) => row.pass).length,
  citationPasses: rows.filter((row, index) => cases[index].expectCitation && row.citation).length,
  citationChecked: citationRows.length,
  failures: rows.filter((row) => !row.pass || !row.citation || !row.lowConfidenceOk),
};

writeFileSync(new URL("./results.json", import.meta.url), `${JSON.stringify(summary, null, 2)}\n`);

console.log(JSON.stringify(summary, null, 2));
if (summary.failures.length) process.exitCode = 1;

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
