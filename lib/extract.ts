import type { Area, Category, Gender, Occupation, Profile } from "./types";

const STATES: { name: string; keys: string[] }[] = [
  { name: "Andhra Pradesh", keys: ["andhra", "आंध्र"] },
  { name: "Arunachal Pradesh", keys: ["arunachal", "अरुणाचल"] },
  { name: "Assam", keys: ["assam", "असम"] },
  { name: "Bihar", keys: ["bihar", "बिहार"] },
  { name: "Chhattisgarh", keys: ["chhattisgarh", "chhatisgarh", "छत्तीसगढ़"] },
  { name: "Goa", keys: ["goa", "गोवा"] },
  { name: "Gujarat", keys: ["gujarat", "गुजरात"] },
  { name: "Haryana", keys: ["haryana", "हरियाणा"] },
  { name: "Himachal Pradesh", keys: ["himachal", "हिमाचल"] },
  { name: "Jharkhand", keys: ["jharkhand", "झारखंड", "झारखण्ड"] },
  { name: "Karnataka", keys: ["karnataka", "कर्नाटक"] },
  { name: "Kerala", keys: ["kerala", "केरल"] },
  { name: "Madhya Pradesh", keys: ["madhya pradesh", "madhya", "मध्य प्रदेश"] },
  { name: "Maharashtra", keys: ["maharashtra", "महाराष्ट्र"] },
  { name: "Manipur", keys: ["manipur", "मणिपुर"] },
  { name: "Meghalaya", keys: ["meghalaya", "मेघालय"] },
  { name: "Mizoram", keys: ["mizoram", "मिज़ोरम"] },
  { name: "Nagaland", keys: ["nagaland", "नागालैंड"] },
  { name: "Odisha", keys: ["odisha", "orissa", "ओडिशा", "उड़ीसा"] },
  { name: "Punjab", keys: ["punjab", "पंजाब"] },
  { name: "Rajasthan", keys: ["rajasthan", "राजस्थान"] },
  { name: "Sikkim", keys: ["sikkim", "सिक्किम"] },
  { name: "Tamil Nadu", keys: ["tamil nadu", "tamil", "तमिलनाडु"] },
  { name: "Telangana", keys: ["telangana", "तेलंगाना"] },
  { name: "Tripura", keys: ["tripura", "त्रिपुरा"] },
  { name: "Uttar Pradesh", keys: ["uttar pradesh", "utter pradesh", "उत्तर प्रदेश"] },
  { name: "Uttarakhand", keys: ["uttarakhand", "uttrakhand", "उत्तराखंड"] },
  { name: "West Bengal", keys: ["west bengal", "bengal", "पश्चिम बंगाल"] },
  { name: "Delhi", keys: ["delhi", "new delhi", "दिल्ली"] },
  { name: "Jammu and Kashmir", keys: ["jammu", "kashmir", "जम्मू"] },
  { name: "Ladakh", keys: ["ladakh", "लद्दाख"] },
  { name: "Chandigarh", keys: ["chandigarh", "चंडीगढ़"] },
  { name: "Puducherry", keys: ["puducherry", "pondicherry"] },
];

function fold(input: string): string {
  return input
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[।!?.,/\\|()[\]{}"“”:+\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text: string, keys: string[]): boolean {
  return keys.some((key) => text.includes(key));
}

function readAge(text: string): number | undefined {
  const daughter = text.match(/(?:beti|बेटी|daughter)\D{0,10}(\d{1,3})/);
  const daughterAge = daughter ? Number(daughter[1]) : undefined;
  const patterns = [
    /(?:umar|umra|age|उम्र|उमर|आयु)\s*(\d{1,3})/,
    /(\d{1,3})\s*(?:saal|sal|varsh|years|year|yrs|साल|वर्ष)/,
    /(\d{1,3})\s*(?:year old|saal ka|saal ki|साल का|साल की|वर्ष का|वर्ष की)/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const age = Number(match[1]);
    if (age < 0 || age > 120) continue;
    if (daughterAge === age && /beti|बेटी|daughter/.test(text) && !/(?:meri umar|my age|main \d)/.test(text)) {
      continue;
    }
    return age;
  }
  return undefined;
}

function readIncome(text: string): number | undefined {
  const lakh = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|लाख)/);
  if (lakh) return Math.round(Number(lakh[1]) * 100000);
  const hazar = text.match(/(\d+(?:\.\d+)?)\s*(?:hazaar|hazar|thousand|हज़ार|हजार)/);
  if (hazar) return Math.round(Number(hazar[1]) * 1000);
  const labelled = text.match(/(?:income|aay|आय|kamaai|कमाई)\s*(\d{4,8})/);
  if (labelled) return Number(labelled[1]);
  return undefined;
}

function readLand(text: string): number | undefined {
  const acre = text.match(/(\d+(?:\.\d+)?)\s*(?:acre|acres|ekad|एकड़)/);
  if (acre) return Number(acre[1]);
  const hectare = text.match(/(\d+(?:\.\d+)?)\s*(?:hectare|hectares|हेक्टेयर)/);
  if (hectare) return Number((Number(hectare[1]) * 2.47105).toFixed(2));
  return undefined;
}

function readOccupation(text: string): Occupation | undefined {
  if (hasAny(text, ["kisan", "kisaan", "किसान", "kheti", "खेती", "farmer", "krishi"])) return "farmer";
  if (hasAny(text, ["thela", "ठेला", "rehri", "रेहड़ी", "street vendor", "pheri", "फेरी", "patri wala", "पटरी"])) {
    return "street_vendor";
  }
  if (hasAny(text, ["lohar", "लोहार", "badhai", "बढ़ई", "kumhar", "कुम्हार", "sonar", "सुनार", "karigar", "कारीगर", "mistri", "मिस्त्री", "artisan", "vishwakarma", "विश्वकर्मा"])) {
    return "artisan";
  }
  if (hasAny(text, ["student", "vidyarthi", "विद्यार्थी", "chhatra", "छात्र", "padhai", "पढ़ाई", "college", "कॉलेज", "school", "स्कूल"])) {
    return "student";
  }
  if (hasAny(text, ["mazdoor", "majdoor", "मजदूर", "dihadi", "दिहाड़ी", "daily wage", "labour", "labor", "मज़दूर"])) {
    return "daily_wage";
  }
  if (hasAny(text, ["naukri", "नौकरी", "salaried", "job karta", "नौकरीपेशा"])) return "salaried";
  if (hasAny(text, ["dukan", "दुकान", "vyapar", "व्यापार", "business", "karobar", "कारोबार", "self employed", "dukandar"])) {
    return "self_employed";
  }
  if (hasAny(text, ["homemaker", "ghar par rehti", "गृहिणी", "housewife"])) return "homemaker";
  return undefined;
}

function readGender(text: string): Gender | undefined {
  if (hasAny(text, ["mahila", "महिला", "aurat", "औरत", "female", "woman", "stri", "स्त्री", "ladki hoon", "मैं औरत"])) {
    return "female";
  }
  if (hasAny(text, ["purush", "पुरुष", "aadmi", "aadmi hoon", "आदमी", "male", "man hoon"])) return "male";
  return undefined;
}

function readCategory(text: string): Category | undefined {
  if (hasAny(text, ["scheduled tribe", "anusuchit janjati", "janjati", "जनजाति", " st ", "एसटी"])) return "st";
  if (hasAny(text, ["scheduled caste", "anusuchit jati", "अनुसूचित जाति", " sc ", "एससी"])) return "sc";
  if (hasAny(text, ["obc", "ओबीसी", "backward class"])) return "obc";
  if (hasAny(text, ["ews", "ईडब्ल्यूएस"])) return "ews";
  if (hasAny(text, ["general category", "सामान्य वर्ग"])) return "general";
  return undefined;
}

function readBool(text: string, yes: string[], no: string[]): boolean | undefined {
  if (hasAny(text, no)) return false;
  if (hasAny(text, yes)) return true;
  return undefined;
}

export function extractProfile(message: string): Partial<Profile> {
  const text = ` ${fold(message)} `;
  const profile: Partial<Profile> = {};
  const age = readAge(text);
  if (age !== undefined) profile.age = age;
  const income = readIncome(text);
  if (income !== undefined) profile.annualIncome = income;
  const land = readLand(text);
  if (land !== undefined) profile.landAcres = land;

  for (const state of STATES) {
    if (state.keys.some((key) => text.includes(key))) {
      profile.state = state.name;
      break;
    }
  }
  if (hasAny(text, [" u.p ", " u p ", " up "]) && !profile.state) profile.state = "Uttar Pradesh";
  if (hasAny(text, [" m.p ", " mp "]) && !profile.state) profile.state = "Madhya Pradesh";

  const occupation = readOccupation(text);
  if (occupation) profile.occupation = occupation;
  if (occupation === "artisan") profile.isArtisan = true;
  if (occupation === "street_vendor") profile.isStreetVendor = true;

  const gender = readGender(text);
  if (gender) profile.gender = gender;
  const category = readCategory(text);
  if (category) profile.category = category;

  if (hasAny(text, ["gaon", "गांव", "गाँव", "rural", "gramin", "ग्रामीण"])) profile.area = "rural" satisfies Area;
  if (hasAny(text, ["shehar", "शहर", "urban", "city"])) profile.area = "urban";

  const bank = readBool(
    text,
    ["bank account hai", "bank khata hai", "बैंक खाता है", "have a bank", "bank account"],
    ["bank account nahi", "no bank", "बैंक खाता नहीं", "bina bank"],
  );
  if (bank !== undefined) profile.hasBankAccount = bank;

  const daughterYears = text.match(/(?:beti|बेटी|daughter)\D{0,10}(\d{1,3})/);
  if (hasAny(text, ["beti nahi", "बेटी नहीं", "no daughter"])) {
    profile.hasGirlChildUnder10 = false;
  } else if (daughterYears) {
    profile.hasGirlChildUnder10 = Number(daughterYears[1]) < 10;
  } else if (hasAny(text, ["beti hai", "beti ", "बेटी", "girl child", "chhoti beti", "daughter"])) {
    profile.hasGirlChildUnder10 = true;
  }

  const pregnant = readBool(
    text,
    ["garbhvati", "गर्भवती", "pregnant", "prasav", "प्रसव", "baby coming"],
    ["pregnant nahi", "गर्भवती नहीं"],
  );
  if (pregnant !== undefined) profile.isPregnant = pregnant;

  const pucca = readBool(
    text,
    ["pakka ghar", "pucca house", "पक्का मकान", "पक्का घर"],
    ["kachcha", "kaccha", "कच्चा मकान", "कच्चा घर", "no house", "बेघर"],
  );
  if (pucca !== undefined) profile.hasPuccaHouse = pucca;

  const bpl = readBool(
    text,
    ["bpl", "बीपीएल", "gariib", "gareeb", "गरीब", "गरीबी रेखा", "below poverty"],
    ["bpl nahi", "not bpl", "बीपीएल नहीं", "am not poor"],
  );
  if (bpl !== undefined) profile.isBpl = bpl;

  const tax = readBool(
    text,
    ["income tax bharta", "tax bharta", "इनकम टैक्स भर", "pay income tax", "taxpayer"],
    ["tax nahi", "टैक्स नहीं", "no income tax", "tax nahi bharta"],
  );
  if (tax !== undefined) profile.paysIncomeTax = tax;

  return profile;
}

export function mergeProfiles(base: Profile | undefined, extracted: Partial<Profile>): Profile {
  return { ...(base ?? {}), ...stripUndefined(extracted) };
}

function stripUndefined(input: Partial<Profile>): Partial<Profile> {
  const output: Partial<Profile> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) (output as Record<string, unknown>)[key] = value;
  }
  return output;
}

export const INDIAN_STATES = STATES.map((state) => state.name);
