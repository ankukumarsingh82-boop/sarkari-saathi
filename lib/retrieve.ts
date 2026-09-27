import { schemes } from "./schemes";

export function foldText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[।!?.,/\\|()[\]{}"“”:+\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const OUT_OF_SCOPE = [
  "cricket",
  "क्रिकेट",
  "ipl",
  "mausam",
  "मौसम",
  "weather",
  "film",
  "movie",
  "फिल्म",
  "gana",
  "गाना",
  "joke",
  "चुटकुला",
  "python",
  "javascript",
  "recipe",
  "girlfriend",
  "boyfriend",
];

const GREETING = ["namaste", "नमस्ते", "hello", "राम राम", "ram ram", "namaskar", "नमस्कार"];

const GENERAL = [
  "kaunsi yojana",
  "kaun si yojana",
  "कौन सी योजना",
  "कौनसी योजना",
  "kya milega",
  "क्या मिलेगा",
  "kya mil sakta",
  "mil sakti",
  "मिल सकती",
  "पात्रता",
  "eligible scheme",
  "which scheme",
  "yojana batao",
  "योजना बताओ",
  "योजना",
  "yojana",
  "scheme",
  "kya kya mil",
];

export function retrievalScores(message: string): Map<string, number> {
  const text = foldText(message);
  const scores = new Map<string, number>();
  for (const scheme of schemes) {
    let score = 0;
    for (const keyword of scheme.keywords) {
      if (text.includes(foldText(keyword.phrase))) score += keyword.weight;
    }
    scores.set(scheme.id, score);
  }
  return scores;
}

export function isOutOfScope(message: string, bestScore: number): boolean {
  if (bestScore > 0) return false;
  const text = foldText(message);
  return OUT_OF_SCOPE.some((token) => text.includes(token));
}

export function isGreeting(message: string): boolean {
  const text = foldText(message);
  return GREETING.some((token) => text.includes(token)) && text.length < 40;
}

export function isGeneralAsk(message: string): boolean {
  const text = foldText(message);
  return GENERAL.some((token) => text.includes(token));
}

export function bestScore(scores: Map<string, number>): number {
  let best = 0;
  for (const score of scores.values()) best = Math.max(best, score);
  return best;
}
