export type Occupation =
  | "farmer"
  | "daily_wage"
  | "student"
  | "self_employed"
  | "salaried"
  | "homemaker"
  | "artisan"
  | "street_vendor"
  | "unemployed"
  | "other";

export type Category = "general" | "obc" | "sc" | "st" | "ews" | "unknown";
export type Gender = "female" | "male" | "other" | "unknown";
export type Area = "rural" | "urban" | "unknown";

export interface Profile {
  name?: string;
  age?: number;
  state?: string;
  occupation?: Occupation;
  annualIncome?: number;
  landAcres?: number;
  category?: Category;
  gender?: Gender;
  area?: Area;
  hasBankAccount?: boolean;
  hasGirlChildUnder10?: boolean;
  isPregnant?: boolean;
  hasPuccaHouse?: boolean;
  isBpl?: boolean;
  paysIncomeTax?: boolean;
  isArtisan?: boolean;
  isStreetVendor?: boolean;
}

export type MatchStatus = "eligible" | "likely" | "ineligible" | "unknown";

export interface Scheme {
  id: string;
  nameHi: string;
  nameEn: string;
  ministry: string;
  benefitHi: string;
  benefitEn: string;
  eligibilityHi: string[];
  eligibilityEn: string[];
  documentsHi: string[];
  documentsEn: string[];
  summaryHi: string;
  summaryEn: string;
  officialUrl: string;
  sourceUrl: string;
  sourceCheckedOn: string;
  helpline?: string;
  keywords: { phrase: string; weight: number }[];
}

export interface SchemeMatch {
  schemeId: string;
  status: MatchStatus;
  confidence: number;
  reasonsHi: string[];
  reasonsEn: string[];
  missingHi: string[];
  retrievalScore: number;
}

export interface Citation {
  schemeId: string;
  title: string;
  url: string;
  checkedOn: string;
}

export interface Answer {
  answerHi: string;
  answerEn: string;
  confidence: number;
  lowConfidence: boolean;
  needsInfo: boolean;
  outOfScope: boolean;
  schemes: SchemeMatch[];
  citations: Citation[];
  followUpsHi: string[];
  followUpsEn: string[];
  profile: Profile;
  mode: "local" | "gemini" | "openai";
}
