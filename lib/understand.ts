import { matchState } from "./extract";
import { geminiConfigured, geminiGenerate } from "./gemini";
import type { Occupation, Profile } from "./types";

const OCCUPATIONS: Occupation[] = [
  "farmer",
  "daily_wage",
  "student",
  "self_employed",
  "salaried",
  "homemaker",
  "artisan",
  "street_vendor",
  "unemployed",
  "other",
];

const OCCUPATION_CUES: Record<Occupation, string[]> = {
  farmer: ["kisan", "kisaan", "किसान", "kheti", "खेती", "farmer", "krishi"],
  street_vendor: ["thela", "ठेला", "rehri", "रेहड़ी", "street vendor", "pheri", "फेरी", "patri wala", "पटरी"],
  artisan: ["lohar", "लोहार", "badhai", "बढ़ई", "kumhar", "कुम्हार", "sonar", "सुनार", "karigar", "कारीगर", "mistri", "मिस्त्री", "artisan", "vishwakarma", "विश्वकर्मा"],
  student: ["student", "vidyarthi", "विद्यार्थी", "chhatra", "छात्र", "padhai", "पढ़ाई", "college", "कॉलेज", "school", "स्कूल"],
  daily_wage: ["mazdoor", "majdoor", "मजदूर", "dihadi", "दिहाड़ी", "daily wage", "labour", "labor", "मज़दूर"],
  salaried: ["naukri", "नौकरी", "salaried", "job karta", "नौकरीपेशा"],
  self_employed: ["dukan", "दुकान", "vyapar", "व्यापार", "business", "karobar", "कारोबार", "self employed", "dukandar"],
  homemaker: ["homemaker", "ghar par rehti", "गृहिणी", "housewife"],
  unemployed: ["berozgar", "बेरोजगार", "unemployed"],
  other: [],
};

const WORD_NUMBERS: [string, number][] = [
  ["pachhattar", 75],
  ["पचहत्तर", 75],
  ["paintalis", 45],
  ["पैंतालीस", 45],
  ["painsath", 65],
  ["पैंसठ", 65],
  ["pachchees", 25],
  ["पच्चीस", 25],
  ["bayaalis", 42],
  ["बयालीस", 42],
  ["atharah", 18],
  ["अठारह", 18],
  ["pandrah", 15],
  ["पंद्रह", 15],
  ["chaalis", 40],
  ["chalis", 40],
  ["चालीस", 40],
  ["pachaas", 50],
  ["pachas", 50],
  ["पचास", 50],
  ["pachpan", 55],
  ["पचपन", 55],
  ["barah", 12],
  ["बारह", 12],
  ["sattar", 70],
  ["सत्तर", 70],
  ["saath", 60],
  ["साठ", 60],
  ["nabbe", 90],
  ["नब्बे", 90],
  ["paanch", 5],
  ["panch", 5],
  ["पाँच", 5],
  ["पांच", 5],
  ["chaar", 4],
  ["चार", 4],
  ["teen", 3],
  ["तीन", 3],
  ["bees", 20],
  ["बीस", 20],
  ["tees", 30],
  ["तीस", 30],
  ["assi", 80],
  ["अस्सी", 80],
  ["aath", 8],
  ["आठ", 8],
  ["saat", 7],
  ["सात", 7],
  ["chhe", 6],
  ["छह", 6],
  ["das", 10],
  ["दस", 10],
  ["nau", 9],
  ["नौ", 9],
  ["sau", 100],
  ["सौ", 100],
  ["tin", 3],
  ["sat", 7],
  ["ath", 8],
  ["che", 6],
  ["seven", 7],
  ["eight", 8],
  ["three", 3],
  ["four", 4],
  ["five", 5],
  ["nine", 9],
  ["two", 2],
  ["six", 6],
  ["ten", 10],
  ["one", 1],
  ["ek", 1],
  ["एक", 1],
  ["do", 2],
  ["दो", 2],
];

const EN_TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const EN_ONES: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

type FillKey = "age" | "gender" | "occupation" | "landAcres" | "paysIncomeTax" | "hasPuccaHouse" | "state";

const FILL_KEYS: FillKey[] = ["age", "gender", "occupation", "landAcres", "paysIncomeTax", "hasPuccaHouse", "state"];

function fold(input: string): string {
  return input
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[।!?.,/\\|()[\]{}"“”:+\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function spokenNumbers(text: string): number[] {
  const found: number[] = [];
  const compound = /(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:\s+|-)?(?:one|two|three|four|five|six|seven|eight|nine)?/g;
  for (const match of text.matchAll(compound)) {
    const parts = match[0].split(/[\s-]+/);
    const tens = EN_TENS[parts[0]];
    const ones = parts[1] ? EN_ONES[parts[1]] : 0;
    if (tens) found.push(tens + (ones ?? 0));
  }
  for (const [word, value] of WORD_NUMBERS) {
    const pattern = new RegExp(`(^|[^a-z\\u0900-\\u097F])${word}([^a-z\\u0900-\\u097F]|$)`);
    if (pattern.test(text)) found.push(value);
  }
  return found;
}

export function messageNeedsUnderstanding(message: string, known: Partial<Profile>): boolean {
  const text = fold(message);
  if (text.length < 3) return false;
  if (known.age === undefined && spokenNumbers(text).length > 0 && /saal|साल|varsh|वर्ष|umar|उम्र|उमर|आयु|age|years/.test(text)) {
    return true;
  }
  if (known.gender === undefined && /(^|[^a-z])lady([^a-z]|$)/.test(text)) return true;
  if (known.paysIncomeTax === undefined && /itr|i t r|आयकर|tax|टैक्स|करदाता/.test(text)) return true;
  if (known.hasPuccaHouse === undefined && /jhuggi|झुग्गी|jhopdi|झोपड़ी|tin shed|chappar|छप्पर/.test(text)) return true;
  if (
    known.landAcres === undefined &&
    /acre|एकड़|hectare|हेक्टेयर|ekad/.test(text) &&
    !/\d+(?:\.\d+)?\s*(?:acre|एकड़|hectare|हेक्टेयर|ekad)/.test(text) &&
    spokenNumbers(text).length > 0
  ) {
    return true;
  }
  return false;
}

function evidenceInMessage(message: string, evidence: string): boolean {
  const quote = evidence.trim();
  if (quote.length < 2) return false;
  return fold(message).includes(fold(quote));
}

function isDaughterAge(message: string, age: number): boolean {
  const text = fold(message);
  if (!/beti|बेटी|daughter|girl child/.test(text)) return false;
  const digits = text.match(/(?:beti|बेटी|daughter|girl child)\D{0,16}(\d{1,3})/);
  if (digits && Number(digits[1]) === age) return true;
  const after = text.split(/beti|बेटी|daughter|girl child/).slice(1).join(" ").slice(0, 24);
  return spokenNumbers(after).includes(age);
}

function ageSupported(evidence: string, age: number): boolean {
  if (!Number.isInteger(age) || age < 1 || age > 120) return false;
  const text = fold(evidence);
  if (!/saal|साल|varsh|वर्ष|umar|उम्र|उमर|आयु|age|years|year/.test(text)) return false;
  if (new RegExp(`(^|\\D)${age}(\\D|$)`).test(text)) return true;
  return spokenNumbers(text).includes(age);
}

function genderSupported(evidence: string, gender: string): boolean {
  const text = fold(evidence);
  const female = /lady|woman|female|mahila|महिला|aurat|औरत|stri|स्त्री|ladki/.test(text);
  const male = /purush|पुरुष|aadmi|आदमी|male|(^|[^a-z])man([^a-z]|$)/.test(text);
  if (gender === "female") return female && !male;
  if (gender === "male") return male && !female;
  return false;
}

function occupationSupported(evidence: string, occupation: Occupation): boolean {
  const text = fold(evidence);
  const cues = OCCUPATION_CUES[occupation];
  return cues.some((cue) => text.includes(cue));
}

function landSupported(evidence: string, acres: number): boolean {
  if (typeof acres !== "number" || Number.isNaN(acres) || acres < 0 || acres > 100) return false;
  const text = fold(evidence);
  if (!/acre|एकड़|hectare|हेक्टेयर|ekad|zameen|jamin|जमीन|ज़मीन/.test(text)) return false;
  const numbers = [...spokenNumbers(text)];
  const digit = text.match(/(\d+(?:\.\d+)?)/);
  if (digit) numbers.push(Number(digit[1]));
  if (/hectare|हेक्टेयर/.test(text)) {
    return numbers.some((n) => Math.abs(n * 2.47105 - acres) < 0.06 || Math.abs(n - acres) < 0.06);
  }
  return numbers.some((n) => Math.abs(n - acres) < 0.06);
}

function taxSupported(evidence: string, value: boolean): boolean {
  const text = fold(evidence);
  if (!/itr|i t r|आयकर|tax|टैक्स|करदाता/.test(text)) return false;
  const negative = /nahi|nahin|नहीं|(^|[^a-z])no([^a-z]|$)|not|bina/.test(text);
  return value ? !negative : negative;
}

function houseSupported(evidence: string, pucca: boolean): boolean {
  const text = fold(evidence);
  const kutcha = /jhuggi|झुग्गी|jhopdi|झोपड़ी|kachcha|kaccha|कच्चा|tin shed|chappar|छप्पर|बेघर|no house|homeless/.test(text);
  const pakka = /pakka|pucca|पक्का|pukka/.test(text);
  if (pucca) return pakka && !kutcha;
  return kutcha && !pakka;
}

interface ModelPayload {
  age?: unknown;
  gender?: unknown;
  occupation?: unknown;
  landAcres?: unknown;
  paysIncomeTax?: unknown;
  hasPuccaHouse?: unknown;
  state?: unknown;
  evidence?: Record<string, unknown>;
}

export function acceptModelProfile(message: string, known: Partial<Profile>, raw: unknown): Partial<Profile> {
  if (!raw || typeof raw !== "object") return {};
  const payload = raw as ModelPayload;
  const evidence = payload.evidence && typeof payload.evidence === "object" ? payload.evidence : {};
  const accepted: Partial<Profile> = {};

  const quote = (key: FillKey): string | null => {
    const value = evidence[key];
    if (typeof value !== "string" || !evidenceInMessage(message, value)) return null;
    return value;
  };

  if (known.age === undefined && typeof payload.age === "number" && !isDaughterAge(message, payload.age)) {
    const span = quote("age");
    if (span && ageSupported(span, payload.age)) accepted.age = payload.age;
  }
  if (known.gender === undefined && (payload.gender === "female" || payload.gender === "male")) {
    const span = quote("gender");
    if (span && genderSupported(span, payload.gender)) accepted.gender = payload.gender;
  }
  if (known.occupation === undefined && typeof payload.occupation === "string" && OCCUPATIONS.includes(payload.occupation as Occupation)) {
    const occupation = payload.occupation as Occupation;
    const span = quote("occupation");
    if (span && occupationSupported(span, occupation)) {
      accepted.occupation = occupation;
      if (occupation === "artisan") accepted.isArtisan = true;
      if (occupation === "street_vendor") accepted.isStreetVendor = true;
    }
  }
  if (known.landAcres === undefined && typeof payload.landAcres === "number") {
    const span = quote("landAcres");
    if (span && landSupported(span, payload.landAcres)) accepted.landAcres = payload.landAcres;
  }
  if (known.paysIncomeTax === undefined && typeof payload.paysIncomeTax === "boolean") {
    const span = quote("paysIncomeTax");
    if (span && taxSupported(span, payload.paysIncomeTax)) accepted.paysIncomeTax = payload.paysIncomeTax;
  }
  if (known.hasPuccaHouse === undefined && typeof payload.hasPuccaHouse === "boolean") {
    const span = quote("hasPuccaHouse");
    if (span && houseSupported(span, payload.hasPuccaHouse)) accepted.hasPuccaHouse = payload.hasPuccaHouse;
  }
  if (known.state === undefined && typeof payload.state === "string") {
    const span = quote("state");
    if (span && matchState(` ${fold(span)} `) === payload.state) accepted.state = payload.state;
  }
  return accepted;
}

function parseModelJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/u, "").trim();
  return JSON.parse(trimmed) as unknown;
}

export async function maybeFillProfile(
  message: string,
  known: Partial<Profile>,
  options?: { timeoutMs?: number },
): Promise<Partial<Profile>> {
  if (!geminiConfigured()) return {};
  const text = message.trim().slice(0, 2000);
  if (!messageNeedsUnderstanding(text, known)) return {};
  const missing = FILL_KEYS.filter((key) => known[key] === undefined);
  if (missing.length === 0) return {};
  const prompt = [
    "Extract only the listed profile fields from the message.",
    "Return JSON. Use null when the message does not clearly state the field.",
    "evidence values must be exact substrings copied from the message.",
    "Do not decide scheme eligibility. Do not guess. Do not use a daughter's age as the speaker's age.",
    `Fields: ${missing.join(", ")}.`,
    'Shape: {"age":null,"gender":null,"occupation":null,"landAcres":null,"paysIncomeTax":null,"hasPuccaHouse":null,"state":null,"evidence":{"age":"","gender":"","occupation":"","landAcres":"","paysIncomeTax":"","hasPuccaHouse":"","state":""}}',
    "gender is female or male. occupation is farmer, daily_wage, student, self_employed, salaried, homemaker, artisan, street_vendor, unemployed, or other.",
    "state is an Indian state or union territory in English.",
    "",
    text,
  ].join("\n");
  const generated = await geminiGenerate(prompt, {
    timeoutMs: options?.timeoutMs ?? 4000,
    temperature: 0,
    maxOutputTokens: 800,
    json: true,
  });
  if (!generated) return {};
  try {
    return acceptModelProfile(text, known, parseModelJson(generated));
  } catch {
    return {};
  }
}
