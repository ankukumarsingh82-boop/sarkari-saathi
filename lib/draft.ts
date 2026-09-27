import { getScheme } from "./schemes";
import type { Profile } from "./types";

export interface DraftInput {
  confirmed: boolean;
  applicantName: string;
  schemeId: string;
  profile: Profile;
  aadhaarLast4?: string;
}

export function canDownloadDraft(input: Pick<DraftInput, "confirmed" | "applicantName" | "schemeId">): boolean {
  return input.confirmed && input.applicantName.trim().length > 1 && input.schemeId.trim().length > 0;
}

export function draftLines(input: DraftInput): string[] {
  const scheme = getScheme(input.schemeId);
  const profile = input.profile;
  const lines = [
    "सरकारी साथी — आवेदन सहायता ड्राफ्ट",
    "DRAFT ONLY. This is not an official form and it has not been submitted.",
    "ड्राफ्ट — यह आधिकारिक फ़ॉर्म नहीं है और जमा नहीं किया गया।",
    "",
    `योजना / Scheme: ${scheme ? scheme.nameHi : input.schemeId}`,
    scheme ? `Official page: ${scheme.officialUrl}` : "",
    `Source checked: ${scheme?.sourceCheckedOn ?? ""}`,
    "",
    `नाम / Name: ${input.applicantName.trim()}`,
    `उम्र / Age: ${show(profile.age)}`,
    `लिंग / Gender: ${show(profile.gender)}`,
    `राज्य / State: ${show(profile.state)}`,
    `क्षेत्र / Area: ${show(profile.area)}`,
    `काम / Occupation: ${show(profile.occupation)}`,
    `वर्ग / Category: ${show(profile.category)}`,
    `सालाना आय / Annual income (INR): ${show(profile.annualIncome)}`,
    `खेती की ज़मीन (एकड़) / Land (acres): ${show(profile.landAcres)}`,
    `बैंक खाता / Bank account: ${yesNo(profile.hasBankAccount)}`,
    `बीपीएल / BPL: ${yesNo(profile.isBpl)}`,
    `इनकम टैक्स / Pays income tax: ${yesNo(profile.paysIncomeTax)}`,
    `पक्का मकान / Pucca house: ${yesNo(profile.hasPuccaHouse)}`,
    `10 साल से छोटी बेटी / Girl under 10: ${yesNo(profile.hasGirlChildUnder10)}`,
    `गर्भवती / Pregnant: ${yesNo(profile.isPregnant)}`,
    `आधार के आखिरी 4 अंक / Aadhaar last 4: ${maskAadhaar(input.aadhaarLast4)}`,
    "",
    "घोषणा / Declaration:",
    "मैंने यह ड्राफ्ट पढ़ लिया है। आँकड़े मैंने खुद भरे हैं।",
    "I have read this draft. I filled these details myself.",
    "इसे सरकारी पोर्टल पर जमा करने से पहले मैं आधिकारिक फ़ॉर्म से मिला लूँगा।",
    "Before any portal submission I will match this against the official form.",
    "",
    input.confirmed ? "उपयोगकर्ता की पुष्टि: हाँ, जाँच ली गई है।" : "उपयोगकर्ता की पुष्टि: नहीं।",
    input.confirmed ? "User confirmation: yes, reviewed." : "User confirmation: no.",
  ];
  return lines.filter((line) => line !== undefined);
}

function show(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

function yesNo(value: boolean | undefined): string {
  if (value === true) return "हाँ / yes";
  if (value === false) return "नहीं / no";
  return "—";
}

function maskAadhaar(value: string | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "").slice(-4);
  if (digits.length !== 4) return "नहीं दिया गया / not provided";
  return `XXXX-XXXX-${digits}`;
}
