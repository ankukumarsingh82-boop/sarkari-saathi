import { getScheme } from "./schemes";
import type { MatchStatus, Profile, SchemeMatch } from "./types";

interface RuleResult {
  status: MatchStatus;
  confidence: number;
  reasonsHi: string[];
  reasonsEn: string[];
  missingHi: string[];
}

function known(value: unknown): boolean {
  return value !== undefined && value !== null && value !== "";
}

function result(
  status: MatchStatus,
  confidence: number,
  hi: string,
  en: string,
  missingHi: string[] = [],
): RuleResult {
  return {
    status,
    confidence,
    reasonsHi: [hi],
    reasonsEn: [en],
    missingHi,
  };
}

function between(age: number | undefined, min: number, max: number): boolean {
  return age !== undefined && age >= min && age <= max;
}

export function evaluateScheme(schemeId: string, profile: Profile): RuleResult {
  switch (schemeId) {
    case "pm-kisan":
      return evalPmKisan(profile);
    case "ab-pmjay":
      return evalPmJay(profile);
    case "pmay-g":
      return evalPmay(profile);
    case "pmuy":
      return evalUjjwala(profile);
    case "ssy":
      return evalSsy(profile);
    case "apy":
      return evalApy(profile);
    case "pmjjby":
      return evalPmjjby(profile);
    case "pmsby":
      return evalPmsby(profile);
    case "pmmy":
      return evalMudra(profile);
    case "pm-vishwakarma":
      return evalVishwakarma(profile);
    case "nsp":
      return evalNsp(profile);
    case "eshram":
      return evalEshram(profile);
    case "pm-svanidhi":
      return evalSvanidhi(profile);
    case "jsy":
      return evalJsy(profile);
    case "ignoaps":
      return evalIgnaps(profile);
    default:
      return result("unknown", 0.2, "इस योजना का नियम उपलब्ध नहीं है।", "No rule is available for this scheme.");
  }
}

function evalPmKisan(profile: Profile): RuleResult {
  if (profile.occupation && profile.occupation !== "farmer") {
    return result("ineligible", 0.86, "यह योजना ज़मीन रखने वाले किसान परिवार के लिए है।", "This scheme is for a landholding farmer family.");
  }
  if (profile.paysIncomeTax === true) {
    return result(
      "ineligible",
      0.9,
      "पिछले निर्धारण वर्ष में इनकम टैक्स भरने वाले परिवार पीएम किसान से बाहर हैं।",
      "A family that paid income tax in the last assessment year is excluded from PM-KISAN.",
    );
  }
  if (profile.landAcres === 0) {
    return result("ineligible", 0.84, "पीएम किसान के लिए खेती की ज़मीन दर्ज होनी चाहिए।", "PM-KISAN needs cultivable land on record.");
  }
  if (profile.hasBankAccount === false) {
    return result(
      "ineligible",
      0.8,
      "किस्त आधार से जुड़े बैंक खाते में आती है। पहले खाता खुलवाना होगा।",
      "The instalment is paid into an Aadhaar-seeded bank account.",
    );
  }
  if (profile.occupation === "farmer" && known(profile.landAcres) && (profile.landAcres as number) > 0) {
    return result(
      "eligible",
      0.84,
      "आप किसान हैं और खेती की ज़मीन बताई है। राज्य भूमि रिकॉर्ड से अंतिम नाम जाँचता है।",
      "You are a farmer with cultivable land stated. The state still verifies the land record.",
    );
  }
  if (!profile.occupation || !known(profile.landAcres)) {
    return result(
      "unknown",
      0.4,
      "पीएम किसान तभी बनता है जब परिवार के पास खेती की ज़मीन हो।",
      "PM-KISAN applies when the family holds cultivable land.",
      ["आप कितनी खेती की ज़मीन जोतते हैं?"],
    );
  }
  return result("unknown", 0.35, "ज़मीन का विवरण अधूरा है।", "The land detail is incomplete.");
}

function evalPmJay(profile: Profile): RuleResult {
  if (known(profile.age) && (profile.age as number) >= 70) {
    return result(
      "eligible",
      0.82,
      "70 वर्ष या उससे अधिक उम्र को सामाजिक-आर्थिक स्थिति से अलग कवर में जोड़ा गया है। कार्ड फिर भी आयुष्मान पोर्टल पर बनता है।",
      "Age 70 or above is covered irrespective of socio-economic status. The card is still issued on the Ayushman portal.",
    );
  }
  if (profile.isBpl === true) {
    return result(
      "likely",
      0.58,
      "बीपीएल परिवार अक्सर सूची के करीब होते हैं, पर अंतिम नाम एसईसीसी या राज्य की लाभार्थी सूची पर निर्भर है।",
      "A BPL household is often close to the list, but the final name depends on SECC or the state beneficiary list.",
    );
  }
  return result(
    "unknown",
    0.34,
    "आयुष्मान का नाम पोर्टल पर जाँचना होता है। अकेले आय से यह तय नहीं होता।",
    "The Ayushman name has to be checked on the portal. Income alone does not decide it.",
    ["क्या आपकी उम्र 70 वर्ष या उससे अधिक है, या परिवार बीपीएल सूची में है?"],
  );
}

function evalPmay(profile: Profile): RuleResult {
  if (profile.area === "urban") {
    return result(
      "ineligible",
      0.8,
      "यह ग्रामीण आवास योजना है। शहर के लिए अलग मिशन है।",
      "This is the rural housing scheme. Urban housing is a different mission.",
    );
  }
  if (profile.hasPuccaHouse === true) {
    return result("ineligible", 0.86, "जिनके पास पहले से पक्का मकान है, वे इस सहायता के लक्ष्य में नहीं हैं।", "A household that already has a pucca house is not the target.");
  }
  if (profile.hasPuccaHouse === false) {
    return result(
      "likely",
      0.64,
      "कच्चा या बेघर परिवार लक्ष्य में आता है, पर नाम आवास+ सर्वे और ग्राम सभा में होना चाहिए।",
      "A kutcha or houseless family is the target, but the name must be in the Awaas+ survey and the Gram Sabha list.",
    );
  }
  return result(
    "unknown",
    0.36,
    "यह तभी आगे बढ़ती है जब घर कच्चा या न हो, और परिवार गाँव में रहता हो।",
    "This moves forward when the house is kutcha or absent, and the family lives in a village.",
    ["क्या आप गाँव में कच्चे मकान या बिना मकान के रहते हैं?"],
  );
}

function evalUjjwala(profile: Profile): RuleResult {
  if (profile.gender === "male") {
    return result("ineligible", 0.9, "उज्ज्वला का आवेदक महिला होनी चाहिए।", "The Ujjwala applicant has to be a woman.");
  }
  if (known(profile.age) && (profile.age as number) < 18) {
    return result("ineligible", 0.88, "आवेदक की उम्र 18 वर्ष पूरी होनी चाहिए।", "The applicant must have attained 18 years.");
  }
  if (profile.isBpl === false && profile.gender === "female") {
    return result(
      "ineligible",
      0.7,
      "योजना गरीब घराने की महिला के लिए है, वंचना घोषणा के साथ।",
      "The scheme is for a woman from a poor household, with a deprivation declaration.",
    );
  }
  if (profile.gender === "female" && (!known(profile.age) || (profile.age as number) >= 18) && profile.isBpl === true) {
    return result(
      "likely",
      0.7,
      "महिला, 18 वर्ष और गरीब घराना शर्तों के करीब है। घर में पहले से एलपीजी कनेक्शन नहीं होना चाहिए।",
      "Woman, age 18 and a poor household are close to the rules. The household must not already have an LPG connection.",
    );
  }
  if (profile.gender !== "female" || !known(profile.age) || profile.isBpl === undefined) {
    return result(
      "unknown",
      0.38,
      "उज्ज्वला के लिए महिला आवेदक, 18 वर्ष और गरीब घराना चाहिए।",
      "Ujjwala needs a woman applicant, age 18, and a poor household.",
      ["क्या आवेदक 18 वर्ष या अधिक की महिला हैं, और घर गरीब घराना है?"],
    );
  }
  return result("unknown", 0.3, "उज्ज्वला की जाँच अधूरी है।", "The Ujjwala check is incomplete.");
}

function evalSsy(profile: Profile): RuleResult {
  if (profile.hasGirlChildUnder10 === true) {
    return result(
      "eligible",
      0.86,
      "दस वर्ष से छोटी बालिका के नाम अभिभावक खाता खोल सकता है। एक परिवार में सामान्यतः दो खाते।",
      "A guardian can open the account for a girl under ten. A family normally opens two such accounts.",
    );
  }
  if (profile.gender === "female" && known(profile.age) && (profile.age as number) < 10) {
    return result("eligible", 0.8, "दस वर्ष से छोटी बालिका इस खाते की हकदार है।", "A girl under ten can have this account.");
  }
  if (profile.hasGirlChildUnder10 === false) {
    return result("ineligible", 0.84, "खाता उसी बालिका के लिए है जिसने दस वर्ष पूरे नहीं किए।", "The account is for a girl who has not attained ten years.");
  }
  return result(
    "unknown",
    0.34,
    "सुकन्या तभी बनती है जब परिवार में दस साल से छोटी बेटी हो।",
    "Sukanya applies when the family has a daughter under ten.",
    ["क्या आपके परिवार में 10 साल से छोटी बेटी है?"],
  );
}

function evalApy(profile: Profile): RuleResult {
  if (profile.paysIncomeTax === true) {
    return result(
      "ineligible",
      0.9,
      "1 अक्टूबर 2022 से इनकम-टैक्स दाता अटल पेंशन योजना में नहीं जुड़ सकते।",
      "From 1 October 2022 an income-tax payer cannot join APY.",
    );
  }
  if (known(profile.age) && ((profile.age as number) < 18 || (profile.age as number) > 40)) {
    return result("ineligible", 0.9, "जुड़ने की उम्र 18 से 40 वर्ष है।", "The joining age is 18 to 40 years.");
  }
  if (profile.hasBankAccount === false) {
    return result("ineligible", 0.86, "अंशदान बचत बैंक खाते से ऑटो-डेबिट होता है।", "The contribution is auto-debited from a savings bank account.");
  }
  if (between(profile.age, 18, 40) && profile.hasBankAccount === true) {
    return result(
      "eligible",
      0.84,
      "उम्र 18 से 40 के बीच है और बैंक खाता है। पेंशन 60 वर्ष पर शुरू होती है। अंशदान की रकम बैंक की तालिका से देखें।",
      "Age is between 18 and 40 and there is a bank account. The pension starts at 60. Read the contribution from the bank table.",
    );
  }
  return result("unknown", 0.36, "अटल पेंशन के लिए उम्र और बैंक खाता दोनों चाहिए।", "APY needs both age and a bank account.", [
    "क्या आपकी उम्र 18 से 40 वर्ष के बीच है और बचत खाता है?",
  ]);
}

function evalPmjjby(profile: Profile): RuleResult {
  if (known(profile.age) && ((profile.age as number) < 18 || (profile.age as number) > 50)) {
    return result(
      "ineligible",
      0.9,
      "नया नामांकन 18 से 50 वर्ष की उम्र में होता है।",
      "A new enrolment is for age 18 to 50.",
    );
  }
  if (profile.hasBankAccount === false) {
    return result("ineligible", 0.86, "प्रीमियम बैंक या डाकघर खाते से कटता है।", "The premium is debited from a bank or post-office account.");
  }
  if (between(profile.age, 18, 50) && profile.hasBankAccount === true) {
    return result(
      "eligible",
      0.86,
      "उम्र कवर में है और बैंक खाता है। किसी भी कारण से मृत्यु पर 2 लाख रुपये और सालाना प्रीमियम 436 रुपये है।",
      "Age is inside the cover and there is a bank account. Death from any cause pays ₹2 lakh. The yearly premium is ₹436.",
    );
  }
  return result("unknown", 0.34, "जीवन ज्योति के लिए 18 से 50 वर्ष और बैंक खाता चाहिए।", "PMJJBY needs age 18 to 50 and a bank account.");
}

function evalPmsby(profile: Profile): RuleResult {
  if (known(profile.age) && ((profile.age as number) < 18 || (profile.age as number) > 70)) {
    return result("ineligible", 0.9, "नामांकन की उम्र 18 से 70 वर्ष है।", "Enrolment age is 18 to 70 years.");
  }
  if (profile.hasBankAccount === false) {
    return result("ineligible", 0.86, "20 रुपये का प्रीमियम खाते से कटता है।", "The ₹20 premium is debited from the account.");
  }
  if (between(profile.age, 18, 70) && profile.hasBankAccount === true) {
    return result(
      "eligible",
      0.86,
      "उम्र 18 से 70 के बीच है और बैंक खाता है। यह दुर्घटना कवर है, सालाना प्रीमियम 20 रुपये।",
      "Age is between 18 and 70 and there is a bank account. This is accident cover, with a yearly premium of ₹20.",
    );
  }
  return result("unknown", 0.34, "सुरक्षा बीमा के लिए उम्र और बैंक खाता चाहिए।", "PMSBY needs age and a bank account.");
}

function evalMudra(profile: Profile): RuleResult {
  const ok = profile.occupation === "self_employed" || profile.occupation === "street_vendor" || profile.occupation === "artisan" || profile.isArtisan || profile.isStreetVendor;
  if (profile.occupation && !ok) {
    return result(
      "ineligible",
      0.78,
      "मुद्रा गैर-कृषि छोटे कारोबार का ऋण है, अनुदान नहीं। केवल नौकरी या केवल खेती इसके लक्ष्य में नहीं है।",
      "Mudra is a loan for a non-farm micro enterprise, not a grant. A salary job or farming alone is not the target.",
    );
  }
  if (ok) {
    return result(
      "likely",
      0.66,
      "छोटे कारोबार या दस्तकारी पर बिना गिरवी ऋण बैंक मंजूर करती है। शिशु श्रेणी 50,000 रुपये तक है।",
      "A bank sanctions a collateral-free loan for a small business or craft. Shishu goes up to ₹50,000.",
    );
  }
  return result("unknown", 0.3, "मुद्रा के लिए छोटा कारोबार या दस्तकारी बतानी होगी।", "Mudra needs a small business or craft.", [
    "क्या आप दुकान, ठेला या दस्तकारी से कमाते हैं?",
  ]);
}

function evalVishwakarma(profile: Profile): RuleResult {
  if (profile.occupation === "artisan" || profile.isArtisan) {
    return result(
      "likely",
      0.7,
      "पारंपरिक कारीगर लक्ष्य में हैं, बशर्ते व्यापार योजना की सूची में हो। पहली ऋण किस्त से पहले बुनियादी प्रशिक्षण है।",
      "A traditional artisan is the target if the trade is on the scheme list. Basic training comes before the first loan tranche.",
    );
  }
  if (profile.occupation) {
    return result("ineligible", 0.8, "यह योजना सूचीबद्ध पारंपरिक कारीगरों के लिए है।", "This scheme is for listed traditional artisans.");
  }
  return result("unknown", 0.3, "बताएँ कि आप बढ़ई, लोहार, सुनार या कुम्हार जैसे कारीगर हैं या नहीं।", "Say whether you are an artisan such as a carpenter, blacksmith, goldsmith or potter.");
}

function evalNsp(profile: Profile): RuleResult {
  if (profile.occupation === "student") {
    return result(
      "likely",
      0.72,
      "छात्र पोर्टल पर आवेदन कर सकते हैं। कौन सी छात्रवृत्ति मिलेगी, यह कक्षा और उस योजना की शर्त पर है। राशि योजना-दर-योजना है।",
      "A student can apply on the portal. Which scholarship fits depends on the class and that scheme's conditions. Amounts differ by scheme.",
    );
  }
  if (profile.occupation) {
    return result("ineligible", 0.8, "यह पोर्टल छात्रों की छात्रवृत्ति के लिए है।", "This portal is for student scholarships.");
  }
  return result("unknown", 0.28, "छात्रवृत्ति के लिए बताएँ कि आप पढ़ रहे हैं।", "For a scholarship, say whether you are studying.", [
    "क्या आप स्कूल या कॉलेज में पढ़ रहे हैं?",
  ]);
}

const ESHRAM_WORK = new Set(["farmer", "daily_wage", "self_employed", "artisan", "street_vendor"]);

function evalEshram(profile: Profile): RuleResult {
  if (known(profile.age) && ((profile.age as number) < 16 || (profile.age as number) > 59)) {
    return result("ineligible", 0.88, "ई-श्रम पंजीकरण की उम्र 16 से 59 वर्ष है।", "e-Shram registration age is 16 to 59 years.");
  }
  if (profile.occupation === "salaried" || profile.occupation === "student") {
    return result(
      "ineligible",
      0.74,
      "ई-श्रम असंगठित कामगार के लिए है, जो ईपीएफओ या ईएसआईसी का सदस्य न हो। नियमित नौकरी या केवल पढ़ाई इसमें नहीं आती।",
      "e-Shram is for an unorganised worker who is not an EPFO or ESIC member. A regular job or study alone does not qualify.",
    );
  }
  if (profile.occupation && ESHRAM_WORK.has(profile.occupation) && (!known(profile.age) || between(profile.age, 16, 59))) {
    return result(
      "likely",
      0.68,
      "असंगठित काम ई-श्रम के करीब है। यह कार्ड है, अपने आप नकद पेंशन नहीं।",
      "Unorganised work is close to e-Shram. The card is not itself a cash pension.",
    );
  }
  return result("unknown", 0.32, "ई-श्रम के लिए असंगठित काम और 16 से 59 वर्ष की उम्र चाहिए।", "e-Shram needs unorganised work and age 16 to 59.");
}

function evalSvanidhi(profile: Profile): RuleResult {
  if (profile.occupation === "street_vendor" || profile.isStreetVendor) {
    return result(
      "likely",
      0.74,
      "रेहड़ी या ठेले वाले के लिए पहली किस्त 15,000 रुपये तक का ऋण हो सकती है। वेंडिंग प्रमाण या सिफ़ारिश पत्र चाहिए।",
      "A street vendor may get a first loan tranche of up to ₹15,000. A vending certificate or recommendation letter is required.",
    );
  }
  if (profile.occupation) {
    return result("ineligible", 0.82, "पीएम स्वनिधि रेहड़ी-पटरी वालों के लिए है।", "PM SVANidhi is for street vendors.");
  }
  return result("unknown", 0.28, "बताएँ कि आप ठेले या रेहड़ी पर बेचते हैं या नहीं।", "Say whether you sell from a cart or a pitch.");
}

function evalJsy(profile: Profile): RuleResult {
  if (profile.gender === "male" || profile.isPregnant === false) {
    return result("ineligible", 0.86, "जननी सुरक्षा योजना गर्भवती महिला के संस्थागत प्रसव के लिए है।", "Janani Suraksha Yojana is for a pregnant woman's institutional delivery.");
  }
  if (profile.gender === "female" && profile.isPregnant === true) {
    return result(
      "likely",
      0.7,
      "गर्भवती महिला लक्ष्य में हैं। राशि राज्य और ग्रामीण या शहरी क्षेत्र पर निर्भर है, इसलिए स्वास्थ्य केन्द्र पर वर्तमान तालिका देखें।",
      "A pregnant woman is the target. The amount depends on the state and on rural or urban area, so check the current table at the health centre.",
    );
  }
  return result("unknown", 0.3, "यह योजना गर्भवती महिला के लिए है।", "This scheme is for a pregnant woman.", [
    "क्या आप गर्भवती हैं?",
  ]);
}

function evalIgnaps(profile: Profile): RuleResult {
  if (known(profile.age) && (profile.age as number) < 60) {
    return result("ineligible", 0.9, "वृद्धावस्था पेंशन 60 वर्ष या उससे अधिक उम्र पर है।", "The old-age pension starts at 60 years.");
  }
  if (profile.isBpl === false && known(profile.age) && (profile.age as number) >= 60) {
    return result(
      "ineligible",
      0.8,
      "केन्द्रीय सहायता गरीबी रेखा से नीचे के परिवार के लिए है।",
      "The central assistance is for a household below the poverty line.",
    );
  }
  if (known(profile.age) && (profile.age as number) >= 60 && profile.isBpl === true) {
    const eighty = (profile.age as number) >= 80;
    return result(
      "eligible",
      0.84,
      eighty
        ? "उम्र 80 या अधिक और बीपीएल परिवार पर केन्द्रीय सहायता 500 रुपये प्रति माह है। राज्य टॉप-अप अलग से जोड़ सकता है।"
        : "उम्र 60 या अधिक और बीपीएल परिवार पर केन्द्रीय सहायता 200 रुपये प्रति माह है। राज्य टॉप-अप अलग से जोड़ सकता है।",
      eighty
        ? "At age 80 or above in a BPL household the central assistance is ₹500 a month. The state may add a top-up."
        : "From age 60 in a BPL household the central assistance is ₹200 a month. The state may add a top-up.",
    );
  }
  return result(
    "unknown",
    0.36,
    "इस पेंशन के लिए 60 वर्ष और बीपीएल परिवार दोनों चाहिए।",
    "This pension needs both age 60 and a BPL household.",
    ["क्या उम्र 60 या अधिक है, और परिवार बीपीएल सूची में है?"],
  );
}

export function evaluateAll(profile: Profile): SchemeMatch[] {
  const ids = [
    "pm-kisan",
    "ab-pmjay",
    "pmay-g",
    "pmuy",
    "ssy",
    "apy",
    "pmjjby",
    "pmsby",
    "pmmy",
    "pm-vishwakarma",
    "nsp",
    "eshram",
    "pm-svanidhi",
    "jsy",
    "ignoaps",
  ];
  return ids.map((schemeId) => {
    const rule = evaluateScheme(schemeId, profile);
    return {
      schemeId,
      status: rule.status,
      confidence: rule.confidence,
      reasonsHi: rule.reasonsHi,
      reasonsEn: rule.reasonsEn,
      missingHi: rule.missingHi,
      retrievalScore: 0,
    };
  });
}

export function positiveStatuses(status: MatchStatus): boolean {
  return status === "eligible" || status === "likely";
}

export function schemeName(schemeId: string, hi: boolean): string {
  const scheme = getScheme(schemeId);
  if (!scheme) return schemeId;
  return hi ? scheme.nameHi : scheme.nameEn;
}
