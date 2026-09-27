import type { Profile } from "../lib/types";

export interface EvalCase {
  id: string;
  query: string;
  lang: "hi" | "hinglish";
  profile?: Profile;
  expectedSchemes: string[];
  forbiddenSchemes: string[];
  expectCitation: boolean;
  expectLowConfidence: boolean;
}

const farmer: Profile = {
  age: 42,
  state: "Uttar Pradesh",
  occupation: "farmer",
  landAcres: 2,
  gender: "male",
  area: "rural",
  hasBankAccount: true,
  paysIncomeTax: false,
  isBpl: false,
  hasPuccaHouse: true,
  hasGirlChildUnder10: false,
  isPregnant: false,
  category: "general",
  annualIncome: 90000,
};

const elder: Profile = {
  age: 68,
  state: "Bihar",
  occupation: "unemployed",
  gender: "male",
  area: "rural",
  hasBankAccount: true,
  isBpl: true,
  paysIncomeTax: false,
  hasPuccaHouse: true,
  hasGirlChildUnder10: false,
};

const guardian: Profile = {
  age: 32,
  state: "Rajasthan",
  occupation: "salaried",
  gender: "male",
  hasBankAccount: true,
  paysIncomeTax: false,
  hasGirlChildUnder10: true,
  isPregnant: false,
};

const vendor: Profile = {
  age: 35,
  state: "Delhi",
  occupation: "street_vendor",
  isStreetVendor: true,
  gender: "male",
  area: "urban",
  hasBankAccount: true,
  paysIncomeTax: false,
  isBpl: true,
};

const artisan: Profile = {
  age: 40,
  state: "Madhya Pradesh",
  occupation: "artisan",
  isArtisan: true,
  gender: "male",
  area: "rural",
  hasBankAccount: true,
  paysIncomeTax: false,
  hasPuccaHouse: true,
};

const mother: Profile = {
  age: 24,
  state: "Bihar",
  occupation: "daily_wage",
  gender: "female",
  area: "rural",
  hasBankAccount: true,
  paysIncomeTax: false,
  isBpl: true,
  hasPuccaHouse: false,
  isPregnant: true,
  hasGirlChildUnder10: false,
};

export const cases: EvalCase[] = [
  { id: "hi-01", lang: "hi", query: "मैं उत्तर प्रदेश का किसान हूँ। उम्र 42 साल। 2 एकड़ ज़मीन है। बैंक खाता है।", expectedSchemes: ["pm-kisan"], forbiddenSchemes: ["ssy", "jsy", "nsp", "ignoaps", "pmuy"], expectCitation: true, expectLowConfidence: false },
  { id: "hg-02", lang: "hinglish", query: "main UP ka kisaan hoon, umar 42, 2 acre zameen, bank account hai", expectedSchemes: ["pm-kisan"], forbiddenSchemes: ["ssy", "jsy", "pmuy"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-03", lang: "hi", query: "मुझे किसान के लिए कौन सी योजना मिलेगी? उम्र 44 साल, 1 एकड़, बैंक खाता है, टैक्स नहीं।", expectedSchemes: ["pm-kisan"], forbiddenSchemes: ["nsp"], expectCitation: true, expectLowConfidence: false },
  { id: "hg-04", lang: "hinglish", query: "mujhe kisaan ke liye kaunsi yojana milegi? umar 44, 1 acre, bank account hai", expectedSchemes: ["pm-kisan"], forbiddenSchemes: ["ssy"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-05", lang: "hi", query: "मैं किसान हूँ, 3 एकड़ ज़मीन, इनकम टैक्स भरता हूँ, उम्र 45 साल, बैंक खाता है", expectedSchemes: [], forbiddenSchemes: ["pm-kisan", "apy"], expectCitation: true, expectLowConfidence: false },
  { id: "hg-06", lang: "hinglish", query: "farmer hoon, 3 acre, income tax bharta hoon, umar 45, bank account hai, pm kisan?", expectedSchemes: [], forbiddenSchemes: ["pm-kisan"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-07", lang: "hi", query: "किसान हूँ 4 एकड़ आय 800000 उम्र 38 साल बैंक खाता है", expectedSchemes: ["pm-kisan"], forbiddenSchemes: [], expectCitation: true, expectLowConfidence: false },
  { id: "hi-08", lang: "hi", query: "किसान हूँ 0 एकड़ ज़मीन उम्र 40 साल", expectedSchemes: [], forbiddenSchemes: ["pm-kisan"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-09", lang: "hi", query: "मेरी बेटी 6 साल की है, सुकन्या खाता खोलना है", expectedSchemes: ["ssy"], forbiddenSchemes: ["pm-kisan"], expectCitation: true, expectLowConfidence: false },
  { id: "hg-10", lang: "hinglish", query: "meri beti 6 saal ki hai, sukanya samriddhi account", expectedSchemes: ["ssy"], forbiddenSchemes: ["ignoaps"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-11", lang: "hi", query: "बेटी नहीं है, सुकन्या समृद्धि मिलेगी? उम्र 34 साल", expectedSchemes: [], forbiddenSchemes: ["ssy"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-12", lang: "hi", query: "मैं पुरुष हूँ, क्या उज्ज्वला मिलेगी? उम्र 30 साल", expectedSchemes: [], forbiddenSchemes: ["pmuy"], expectCitation: true, expectLowConfidence: false },
  { id: "hg-13", lang: "hinglish", query: "main aadmi hoon, ujjwala gas connection milega? umar 30", expectedSchemes: [], forbiddenSchemes: ["pmuy"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-14", lang: "hi", query: "मैं महिला हूँ, उम्र 30 साल, गरीब परिवार, गैस कनेक्शन चाहिए", expectedSchemes: ["pmuy"], forbiddenSchemes: ["pm-kisan"], expectCitation: true, expectLowConfidence: true },
  { id: "hg-15", lang: "hinglish", query: "main mahila hoon, umar 28, gareeb family, lpg connection chahiye", expectedSchemes: ["pmuy"], forbiddenSchemes: [], expectCitation: true, expectLowConfidence: true },
  { id: "hi-16", lang: "hi", query: "मेरी उम्र 68 साल है, बीपीएल हूँ, बुढ़ापे की पेंशन", expectedSchemes: ["ignoaps"], forbiddenSchemes: ["ssy", "jsy"], expectCitation: true, expectLowConfidence: false },
  { id: "hg-17", lang: "hinglish", query: "60 saal ka bpl hoon, old age pension chahiye", expectedSchemes: ["ignoaps"], forbiddenSchemes: ["apy"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-18", lang: "hi", query: "उम्र 80 साल, बीपीएल परिवार, वृद्धावस्था पेंशन", expectedSchemes: ["ignoaps"], forbiddenSchemes: ["eshram"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-19", lang: "hi", query: "उम्र 59 साल, बीपीएल, बुजुर्ग पेंशन मिलेगी?", expectedSchemes: [], forbiddenSchemes: ["ignoaps"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-20", lang: "hi", query: "उम्र 72 साल, इलाज का खर्च कौन देगा, आयुष्मान", expectedSchemes: ["ab-pmjay"], forbiddenSchemes: ["jsy"], expectCitation: true, expectLowConfidence: false },
  { id: "hg-21", lang: "hinglish", query: "70 saal ka hoon, ayushman card banega?", expectedSchemes: ["ab-pmjay"], forbiddenSchemes: ["pmjjby"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-22", lang: "hi", query: "मैं छात्र हूँ, छात्रवृत्ति चाहिए, उम्र 17 साल", expectedSchemes: ["nsp"], forbiddenSchemes: ["pm-kisan", "eshram"], expectCitation: true, expectLowConfidence: true },
  { id: "hg-23", lang: "hinglish", query: "college scholarship chahiye, main student hoon, umar 19", expectedSchemes: ["nsp"], forbiddenSchemes: ["pmuy"], expectCitation: true, expectLowConfidence: true },
  { id: "hg-24", lang: "hinglish", query: "main dilli mein thela lagata hoon, umar 35, bank account hai, svanidhi", expectedSchemes: ["pm-svanidhi"], forbiddenSchemes: ["nsp"], expectCitation: true, expectLowConfidence: true },
  { id: "hi-25", lang: "hi", query: "रेहड़ी पर सब्जी बेचता हूँ, पीएम स्वनिधि", expectedSchemes: ["pm-svanidhi"], forbiddenSchemes: ["ssy"], expectCitation: true, expectLowConfidence: true },
  { id: "hg-26", lang: "hinglish", query: "main lohar hoon, vishwakarma yojana, umar 40", expectedSchemes: ["pm-vishwakarma"], forbiddenSchemes: ["nsp", "jsy"], expectCitation: true, expectLowConfidence: true },
  { id: "hi-27", lang: "hi", query: "मैं कुम्हार हूँ, विश्वकर्मा योजना बताओ", expectedSchemes: ["pm-vishwakarma"], forbiddenSchemes: ["pm-kisan"], expectCitation: true, expectLowConfidence: true },
  { id: "hi-28", lang: "hi", query: "मैं गर्भवती हूँ, उम्र 24 साल, महिला, जननी सुरक्षा योजना", expectedSchemes: ["jsy"], forbiddenSchemes: ["pm-kisan", "ssy"], expectCitation: true, expectLowConfidence: true },
  { id: "hg-29", lang: "hinglish", query: "main pregnant hoon, mahila hoon, umar 26, janani suraksha", expectedSchemes: ["jsy"], forbiddenSchemes: ["ignoaps"], expectCitation: true, expectLowConfidence: true },
  { id: "hi-30", lang: "hi", query: "मैं पुरुष हूँ, जननी सुरक्षा योजना", expectedSchemes: [], forbiddenSchemes: ["jsy"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-31", lang: "hi", query: "दुर्घटना बीमा चाहिए, उम्र 33 साल, बैंक खाता है", expectedSchemes: ["pmsby"], forbiddenSchemes: ["pmjjby"], expectCitation: true, expectLowConfidence: false },
  { id: "hg-32", lang: "hinglish", query: "accident bima chahiye, umar 33, bank account hai", expectedSchemes: ["pmsby"], forbiddenSchemes: [], expectCitation: true, expectLowConfidence: false },
  { id: "hi-33", lang: "hi", query: "दुर्घटना बीमा, उम्र 33 साल, बैंक खाता नहीं", expectedSchemes: [], forbiddenSchemes: ["pmsby"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-34", lang: "hi", query: "जीवन बीमा चाहिए उम्र 29 साल बैंक खाता है", expectedSchemes: ["pmjjby"], forbiddenSchemes: ["pmsby"], expectCitation: true, expectLowConfidence: false },
  { id: "hg-35", lang: "hinglish", query: "jeevan jyoti bima, umar 29, bank account hai", expectedSchemes: ["pmjjby"], forbiddenSchemes: [], expectCitation: true, expectLowConfidence: false },
  { id: "hi-36", lang: "hi", query: "अटल पेंशन योजना, उम्र 45 साल, बैंक खाता है", expectedSchemes: [], forbiddenSchemes: ["apy"], expectCitation: true, expectLowConfidence: false },
  { id: "hg-37", lang: "hinglish", query: "atal pension yojana, umar 30, bank account hai, tax nahi", expectedSchemes: ["apy"], forbiddenSchemes: ["ignoaps"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-38", lang: "hi", query: "ई-श्रम कार्ड कैसे बनेगा, मैं मजदूर हूँ, उम्र 29 साल", expectedSchemes: ["eshram"], forbiddenSchemes: ["nsp"], expectCitation: true, expectLowConfidence: true },
  { id: "hg-39", lang: "hinglish", query: "e shram card, umar 61, mazdoor hoon", expectedSchemes: [], forbiddenSchemes: ["eshram"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-40", lang: "hi", query: "गाँव में कच्चा मकान है, आवास योजना", expectedSchemes: ["pmay-g"], forbiddenSchemes: ["pmuy"], expectCitation: true, expectLowConfidence: true },
  { id: "hg-41", lang: "hinglish", query: "kaccha ghar hai gaon mein, pmay gramin", expectedSchemes: ["pmay-g"], forbiddenSchemes: [], expectCitation: true, expectLowConfidence: true },
  { id: "hi-42", lang: "hi", query: "मेरे पास पक्का मकान है, क्या प्रधानमंत्री आवास योजना मिलेगी", expectedSchemes: [], forbiddenSchemes: ["pmay-g"], expectCitation: true, expectLowConfidence: false },
  { id: "hg-43", lang: "hinglish", query: "main shehar mein rehta hoon, awas yojana chahiye", expectedSchemes: [], forbiddenSchemes: ["pmay-g"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-44", lang: "hi", query: "मुद्रा लोन चाहिए, मेरी दुकान है, उम्र 31 साल", expectedSchemes: ["pmmy"], forbiddenSchemes: ["pm-kisan"], expectCitation: true, expectLowConfidence: true },
  { id: "hg-45", lang: "hinglish", query: "mudra loan for my dukan, umar 31", expectedSchemes: ["pmmy"], forbiddenSchemes: ["jsy"], expectCitation: true, expectLowConfidence: true },
  { id: "hi-46", lang: "hi", query: "आज क्रिकेट का स्कोर क्या है", expectedSchemes: [], forbiddenSchemes: ["pm-kisan", "ab-pmjay", "ssy"], expectCitation: false, expectLowConfidence: true },
  { id: "hg-47", lang: "hinglish", query: "aaj mausam kaisa rahega", expectedSchemes: [], forbiddenSchemes: ["pm-kisan"], expectCitation: false, expectLowConfidence: true },
  { id: "hg-48", lang: "hinglish", query: "python code likh do", expectedSchemes: [], forbiddenSchemes: ["nsp"], expectCitation: false, expectLowConfidence: true },
  { id: "hi-49", lang: "hi", query: "नमस्ते", expectedSchemes: [], forbiddenSchemes: ["pm-kisan"], expectCitation: false, expectLowConfidence: false },
  { id: "hg-50", lang: "hinglish", query: "hello", expectedSchemes: [], forbiddenSchemes: ["pmuy"], expectCitation: false, expectLowConfidence: false },
  { id: "hi-51", lang: "hi", query: "मुझे कौन सी योजना मिल सकती है?", profile: farmer, expectedSchemes: ["pm-kisan", "eshram", "pmjjby", "pmsby"], forbiddenSchemes: ["ssy", "jsy", "nsp", "ignoaps", "pmuy", "pm-svanidhi", "pm-vishwakarma", "pmmy", "apy"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-52", lang: "hi", query: "मेरे लिए योजनाएँ बताओ", profile: elder, expectedSchemes: ["ignoaps", "ab-pmjay", "pmsby"], forbiddenSchemes: ["apy", "pmjjby", "eshram", "ssy", "jsy", "nsp"], expectCitation: true, expectLowConfidence: false },
  { id: "hg-53", lang: "hinglish", query: "which scheme mil sakti hai mujhe", profile: guardian, expectedSchemes: ["ssy", "apy", "pmjjby", "pmsby"], forbiddenSchemes: ["eshram", "pm-kisan", "jsy", "ignoaps"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-54", lang: "hi", query: "मुझे कौन सी योजना मिल सकती है?", profile: vendor, expectedSchemes: ["pm-svanidhi", "pmmy", "eshram", "apy", "pmjjby", "pmsby"], forbiddenSchemes: ["pmay-g", "nsp", "pm-kisan", "jsy"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-55", lang: "hi", query: "योजना बताओ", profile: artisan, expectedSchemes: ["pm-vishwakarma", "pmmy", "eshram", "apy", "pmjjby", "pmsby"], forbiddenSchemes: ["pm-svanidhi", "nsp", "jsy", "ignoaps"], expectCitation: true, expectLowConfidence: false },
  { id: "hi-56", lang: "hi", query: "मुझे कौन सी योजना मिल सकती है?", profile: mother, expectedSchemes: ["jsy", "pmuy", "ab-pmjay", "pmay-g", "eshram", "apy", "pmjjby", "pmsby"], forbiddenSchemes: ["pm-kisan", "ssy", "nsp", "ignoaps", "pm-vishwakarma"], expectCitation: true, expectLowConfidence: false },
  { id: "hg-57", lang: "hinglish", query: "bpl hoon umar 69, ilaj ka scheme ayushman", expectedSchemes: ["ab-pmjay"], forbiddenSchemes: ["ignoaps"], expectCitation: true, expectLowConfidence: true },
  { id: "hi-58", lang: "hi", query: "सुकन्या में साल की कम से कम जमा कितनी है, बेटी है", expectedSchemes: ["ssy"], forbiddenSchemes: [], expectCitation: true, expectLowConfidence: false },
];

export const personas = [
  { id: "ram-farmer-up", label: "42-year-old male farmer, Uttar Pradesh, 2 acres", profile: farmer },
  { id: "shyam-elder-bihar", label: "68-year-old BPL man, Bihar", profile: elder },
  { id: "mohan-guardian", label: "32-year-old salaried father of a girl under 10", profile: guardian },
  { id: "imran-vendor-delhi", label: "35-year-old street vendor, Delhi", profile: vendor },
  { id: "lakhan-artisan-mp", label: "40-year-old artisan, Madhya Pradesh", profile: artisan },
  { id: "sita-pregnant-bihar", label: "24-year-old pregnant daily-wage woman, rural Bihar, BPL, kutcha house", profile: mother },
];
