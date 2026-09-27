import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { cases, personas } from "./cases";
import { answerQuestion } from "../lib/engine";
import { activeModel, maybeRewrite } from "../lib/llm";
import { getScheme } from "../lib/schemes";
import type { Answer } from "../lib/types";

interface Row {
  id: string;
  pass: boolean;
  citation: boolean;
  lowConfidenceOk: boolean;
  missing: string[];
  unexpected: string[];
}

const useLlm = process.argv.includes("--llm");

if (useLlm) loadEnvFiles();

if (useLlm && !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
  console.error("Set GEMINI_API_KEY or OPENAI_API_KEY to run npm run eval -- --llm. Keyless eval is npm run eval.");
  process.exit(1);
}

void main();

async function main() {
  const rows = await score();

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

  if (useLlm) {
    const llmSummary = {
      ...summary,
      mode: activeModel(),
      model: process.env.GEMINI_API_KEY ? process.env.GEMINI_MODEL || "gemini-2.5-flash" : process.env.OPENAI_MODEL || "gpt-4o-mini",
    };
    writeFileSync(new URL("./results-llm.json", import.meta.url), `${JSON.stringify(llmSummary, null, 2)}\n`);
    console.log(JSON.stringify(llmSummary, null, 2));
  } else {
    writeFileSync(new URL("./results.json", import.meta.url), `${JSON.stringify(summary, null, 2)}\n`);
    console.log(JSON.stringify(summary, null, 2));
  }

  if (summary.failures.length) process.exitCode = 1;
}

async function score(): Promise<Row[]> {
  const scored: Row[] = [];
  for (const item of cases) {
    const local = answerQuestion({ message: item.query, profile: item.profile });
    const answer = useLlm ? await maybeRewrite(local, item.query) : local;
    scored.push(grade(item, answer));
  }
  return scored;
}

function grade(item: (typeof cases)[number], answer: Answer): Row {
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
  return {
    id: item.id,
    pass: missing.length === 0 && unexpected.length === 0,
    citation,
    lowConfidenceOk: answer.lowConfidence === item.expectLowConfidence,
    missing,
    unexpected,
  };
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function loadEnvFiles() {
  const merged: Record<string, string> = {};
  for (const path of [".env", ".env.local"]) {
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      merged[key] = value;
    }
  }
  for (const [key, value] of Object.entries(merged)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
