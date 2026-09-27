import { evaluateAll, positiveStatuses } from "./eligibility";
import { extractProfile, mergeProfiles } from "./extract";
import { getScheme, pmayAssistanceText, schemes } from "./schemes";
import { bestScore, isGeneralAsk, isGreeting, isOutOfScope, retrievalScores } from "./retrieve";
import type { Answer, Profile, SchemeMatch } from "./types";

export const LOW_LINE_HI =
  "यह जवाब पक्का नहीं है। कृपया आधिकारिक हेल्पलाइन या नज़दीकी सरकारी कार्यालय पर जाँच करें। हम आपकी तरफ़ से कोई आवेदन जमा नहीं करते।";
const LOW_LINE_EN =
  "This answer is not certain. Please verify it with the official helpline or the nearest government office. Nothing is submitted on your behalf.";

const STATUS_HI: Record<SchemeMatch["status"], string> = {
  eligible: "अभी दी गई जानकारी से आप इस योजना के पात्र हैं",
  likely: "शर्तें करीब हैं, पर अंतिम नाम सरकारी सूची पर निर्भर है",
  ineligible: "अभी दी गई जानकारी से आप इस योजना के पात्र नहीं हैं",
  unknown: "पक्का कहने के लिए कुछ और जानकारी चाहिए",
};

const STATUS_EN: Record<SchemeMatch["status"], string> = {
  eligible: "On the details given, you are eligible for this scheme",
  likely: "The conditions are close, but the final name depends on an official list",
  ineligible: "On the details given, you are not eligible for this scheme",
  unknown: "More information is needed before this can be decided",
};

export function answerQuestion(input: { message: string; profile?: Profile }): Answer {
  const message = (input.message ?? "").trim();
  const profile = mergeProfiles(input.profile, extractProfile(message));
  const scores = retrievalScores(message);
  const top = bestScore(scores);
  const outOfScope = isOutOfScope(message, top);
  const greeting = message.length > 0 && isGreeting(message) && top === 0;
  const general = isGeneralAsk(message) && top === 0;

  const evaluated = evaluateAll(profile).map((match) => ({
    ...match,
    retrievalScore: scores.get(match.schemeId) ?? 0,
  }));

  let selected: SchemeMatch[] = [];
  let needsInfo = false;

  if (message.length === 0) {
    selected = [];
    needsInfo = true;
  } else if (outOfScope) {
    selected = [];
  } else if (top > 0) {
    selected = evaluated
      .filter((match) => match.retrievalScore > 0)
      .sort((a, b) => b.retrievalScore - a.retrievalScore || rank(b) - rank(a))
      .slice(0, 3);
  } else if (general && !greeting) {
    selected = evaluated
      .filter((match) => positiveStatuses(match.status))
      .sort((a, b) => rank(b) - rank(a) || b.confidence - a.confidence)
      .slice(0, 8);
    needsInfo = selected.length === 0;
  } else {
    needsInfo = true;
    selected = [];
  }

  const lowConfidence = outOfScope || (selected.length > 0 && selected.every((match) => match.status !== "eligible" && match.confidence < 0.75));
  const confidence = scoreConfidence(outOfScope, needsInfo, selected);

  const followUpsHi = unique([
    ...selected.flatMap((match) => match.missingHi),
    ...profileQuestions(profile, selected, needsInfo || greeting),
  ]).slice(0, 3);
  const followUpsEn = followUpsHi.map(toEnglishPrompt);

  const answerHi = hindiStops(compose("hi", { message, selected, outOfScope, needsInfo, greeting, lowConfidence, followUpsHi, profile }));
  const answerEn = compose("en", { message, selected, outOfScope, needsInfo, greeting, lowConfidence, followUpsHi: followUpsEn, profile });

  return {
    answerHi,
    answerEn,
    confidence,
    lowConfidence,
    needsInfo,
    outOfScope,
    schemes: selected,
    citations: selected
      .map((match) => getScheme(match.schemeId))
      .filter((scheme): scheme is NonNullable<typeof scheme> => Boolean(scheme))
      .map((scheme) => ({
        schemeId: scheme.id,
        title: scheme.nameEn,
        url: scheme.officialUrl,
        checkedOn: scheme.sourceCheckedOn,
      })),
    followUpsHi,
    followUpsEn,
    profile,
    mode: "local",
  };
}

function rank(match: SchemeMatch): number {
  if (match.status === "eligible") return 4;
  if (match.status === "likely") return 3;
  if (match.status === "unknown") return 2;
  return 1;
}

function scoreConfidence(outOfScope: boolean, needsInfo: boolean, selected: SchemeMatch[]): number {
  if (outOfScope) return 0.12;
  if (selected.some((match) => match.status === "eligible")) return 0.84;
  if (selected.some((match) => match.status === "likely")) return 0.6;
  if (needsInfo) return 0.4;
  if (selected.length > 0) return 0.48;
  return 0.2;
}

function compose(
  lang: "hi" | "en",
  ctx: {
    message: string;
    selected: SchemeMatch[];
    outOfScope: boolean;
    needsInfo: boolean;
    greeting: boolean;
    lowConfidence: boolean;
    followUpsHi: string[];
    profile: Profile;
  },
): string {
  const hi = lang === "hi";
  if (!ctx.message) {
    return hi
      ? "कृपया अपना सवाल टाइप करें या माइक दबाकर बोलें। उम्र, राज्य और काम बताने से योजना ज़्यादा सही निकलती है।"
      : "Please type a question, or press the mic and speak. Age, state, and work make the scheme match more accurate.";
  }
  if (ctx.outOfScope) {
    return hi
      ? `यह सरकारी योजनाओं का सहायक है। ${LOW_LINE_HI}`
      : `This assistant covers government schemes. ${LOW_LINE_EN}`;
  }
  if (ctx.greeting || (ctx.needsInfo && ctx.selected.length === 0)) {
    const ask = ctx.followUpsHi.length ? `\n\n${ctx.followUpsHi.map((line) => `• ${line}`).join("\n")}` : "";
    return hi
      ? `नमस्ते। मैं योजनाएँ आसान हिन्दी में समझाता हूँ। उम्र, राज्य, काम, आय, ज़मीन, वर्ग और लिंग बता दें, या नीचे फ़ॉर्म भर दें।${ask}`
      : `Hello. I explain schemes in plain language. Share age, state, work, income, land, category and gender, or use the form.${ask}`;
  }
  if (ctx.selected.length === 0) {
    return hi
      ? `इस सवाल पर मेरे पास भरोसेमंद योजना नहीं है। ${LOW_LINE_HI}`
      : `I do not have a reliable scheme for this question. ${LOW_LINE_EN}`;
  }

  const blocks = ctx.selected.map((match) => blockFor(match, hi, ctx.profile));
  const lead = hi
    ? "आपकी बात से ये योजनाएँ सामने आती हैं। अंतिम पात्रता सरकारी रिकॉर्ड तय करता है।"
    : "These schemes come up from what you said. The official record decides final eligibility.";
  const extra = ctx.lowConfidence ? `\n\n${hi ? LOW_LINE_HI : LOW_LINE_EN}` : "";
  const asks = ctx.followUpsHi.length ? `\n\n${hi ? "और एक बात:" : "One more thing:"}\n${ctx.followUpsHi.map((line) => `• ${line}`).join("\n")}` : "";
  return `${lead}\n\n${blocks.join("\n\n")}${extra}${asks}`;
}

function hindiStops(text: string): string {
  return text.replace(/([\u0900-\u097F])\.(?=\s|$)/g, "$1।");
}

function sentenceJoin(left: string, right: string, hi: boolean): string {
  const stop = hi ? "।" : ".";
  const head = left.trim().replace(/[।.]+$/u, "");
  const tail = right.trim();
  if (!tail) return `${head}${stop}`;
  return `${head}${stop} ${tail}`;
}

function blockFor(match: SchemeMatch, hi: boolean, profile: Profile): string {
  const scheme = getScheme(match.schemeId);
  if (!scheme) return match.schemeId;
  const name = hi ? scheme.nameHi : scheme.nameEn;
  const summary = hi ? scheme.summaryHi : scheme.summaryEn;
  const status = hi ? STATUS_HI[match.status] : STATUS_EN[match.status];
  const reason = hi ? match.reasonsHi[0] : match.reasonsEn[0];
  const pmay = match.schemeId === "pmay-g" ? pmayAssistanceText(profile.state, hi) : null;
  const helpline = scheme.helpline ? (hi ? `हेल्पलाइन: ${scheme.helpline}` : `Helpline: ${scheme.helpline}`) : "";
  return [
    name,
    summary,
    sentenceJoin(`${hi ? "स्थिति" : "Status"}: ${status}`, reason ?? "", hi),
    pmay,
    `${hi ? "स्रोत" : "Source"}: ${scheme.officialUrl}`,
    helpline,
  ]
    .filter(Boolean)
    .join("\n");
}

function profileQuestions(profile: Profile, selected: SchemeMatch[], ask: boolean): string[] {
  if (!ask && selected.length > 0 && selected.every((match) => match.status === "eligible" || match.status === "ineligible")) {
    return [];
  }
  const questions: string[] = [];
  if (profile.age === undefined) questions.push("आपकी उम्र कितनी है?");
  if (!profile.state) questions.push("आप किस राज्य में रहते हैं?");
  if (!profile.occupation) questions.push("आप क्या काम करते हैं — किसान, मज़दूर, छात्र, कारीगर, रेहड़ी वाला, या कोई और?");
  if (!profile.gender) questions.push("आप महिला हैं, पुरुष हैं, या अन्य?");
  if (profile.occupation === "farmer" && profile.landAcres === undefined) questions.push("आपके नाम कितनी खेती की ज़मीन है?");
  return questions;
}

function toEnglishPrompt(line: string): string {
  const map: Record<string, string> = {
    "आपकी उम्र कितनी है?": "How old are you?",
    "आप किस राज्य में रहते हैं?": "Which state do you live in?",
    "आप क्या काम करते हैं — किसान, मज़दूर, छात्र, कारीगर, रेहड़ी वाला, या कोई और?":
      "What work do you do — farmer, wage worker, student, artisan, street vendor, or something else?",
    "आप महिला हैं, पुरुष हैं, या अन्य?": "Are you a woman, a man, or another gender?",
    "आपके नाम कितनी खेती की ज़मीन है?": "How much cultivable land is in your name?",
    "क्या आपके परिवार में 10 साल से छोटी बेटी है?": "Is there a daughter under 10 in the family?",
    "क्या आप गर्भवती हैं?": "Are you pregnant?",
    "क्या आप गाँव में कच्चे मकान या बिना मकान के रहते हैं?": "Do you live in a village in a kutcha house, or without a house?",
    "क्या आवेदक 18 वर्ष या अधिक की महिला हैं, और घर गरीब घराना है?":
      "Is the applicant a woman of 18 or older, from a poor household?",
    "क्या आपकी उम्र 70 वर्ष या उससे अधिक है, या परिवार बीपीएल सूची में है?":
      "Are you 70 or older, or is the family on the BPL list?",
    "क्या आपकी उम्र 18 से 40 वर्ष के बीच है और बचत खाता है?": "Are you between 18 and 40, with a savings account?",
    "क्या आप स्कूल या कॉलेज में पढ़ रहे हैं?": "Are you in school or college?",
    "क्या उम्र 60 या अधिक है, और परिवार बीपीएल सूची में है?": "Are you 60 or older, and is the family on the BPL list?",
  };
  return map[line] ?? line;
}

function unique(lines: string[]): string[] {
  return [...new Set(lines.filter(Boolean))];
}

export function documentsFor(schemeIds: string[], hi: boolean): { schemeId: string; items: string[] }[] {
  return schemeIds
    .map((schemeId) => {
      const scheme = getScheme(schemeId);
      if (!scheme) return null;
      return { schemeId, items: hi ? scheme.documentsHi : scheme.documentsEn };
    })
    .filter((row): row is { schemeId: string; items: string[] } => Boolean(row));
}

export function listSchemes() {
  return schemes.map((scheme) => ({
    id: scheme.id,
    nameHi: scheme.nameHi,
    nameEn: scheme.nameEn,
    ministry: scheme.ministry,
    officialUrl: scheme.officialUrl,
    sourceCheckedOn: scheme.sourceCheckedOn,
  }));
}
