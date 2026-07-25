import type { JudgeClassification } from "@/types/judge";

// DEV-ONLY FALLBACK. Used only when GEMINI_API_KEY is not configured, so the
// UI/animation flow can be exercised locally without a live key.
//
// This is a keyword heuristic, not a safety system. It must NEVER ship to
// production and must NEVER be treated as real crisis detection — it exists
// purely so the four visual branches can be clicked through during
// development. The route handler logs a loud warning whenever this runs.

// "crisis" now means derogatory/hateful content about religion or faith —
// NOT self-harm or personal danger, which are handled as "serious" below and
// get a normal in-character response. Deliberately keyword-combination based
// (a religion word + a hostile word) rather than a slur list, so this mock
// heuristic doesn't need to embed actual hate speech to demonstrate the branch.
const RELIGION_TERMS = [
  "muslim",
  "hindu",
  "christian",
  "sikh",
  "jewish",
  "buddhist",
  "islam",
  "islamic",
  "hinduism",
  "christianity",
  "sikhism",
  "judaism",
  "buddhism",
  "religion",
  "faith",
];

const HOSTILE_TERMS = [
  "hate",
  "disgusting",
  "inferior",
  "stupid",
  "fake religion",
  "evil",
  "should be banned",
  "terrorist",
  "backward",
  "primitive",
  "brainwashed",
];

const SERIOUS_SIGNALS = [
  "gas leak",
  "building collapse",
  "collapsed",
  "fire hazard",
  "live wire",
  "electrocut",
  "structural crack",
  "bribe",
  "bribery",
  "corruption",
  "unsafe bridge",
  "contaminated water",
  "flooding",
  "court notice",
  "legal notice",
  "suicide",
  "suicidal",
  "kill myself",
  "want to die",
  "end my life",
  "self harm",
  "self-harm",
  "hurt myself",
  "hurting myself",
  "being abused",
  "domestic violence",
  "overdose",
  "no reason to live",
];

// "serious" (case b) — generic political opinion/commentary/gossip about the
// PM, a CM, MPs, MLAs, parties, or elections, with no concrete personal
// grievance attached. Short abbreviations use word-boundary regexes so this
// doesn't false-positive on substrings like "important" or "compensation".
// If the message also names a concrete civic issue (pothole, water, etc.) it
// is treated as a normal complaint instead — that's the app's core use case
// (a letter TO an MLA/MP) and must not be swallowed by this check.
const POLITICAL_ABBR_PATTERN = /\b(pm|cm|mla|mlas|mp|mps)\b/i;
const POLITICAL_PHRASES = [
  "prime minister",
  "chief minister",
  "member of parliament",
  "member of the legislative assembly",
  "politician",
  "political party",
  "ruling party",
  "opposition party",
  "election",
];

const CIVIC_ISSUE_NOUNS = [
  "pothole",
  "road",
  "street light",
  "streetlight",
  "garbage",
  "trash",
  "water supply",
  "water shortage",
  "electricity",
  "power cut",
  "ration card",
  "certificate",
  "license",
  "licence",
  "encroachment",
  "drainage",
  "sewage",
  "property tax",
  "pension",
  "hospital",
  "school admission",
  "passport",
  "aadhar",
  "aadhaar",
  "voter id",
  "office won't",
  "office wont",
  "not responding",
  "never replies",
  "no response",
  "complaint",
  "application",
];

function isGenericPoliticalChatter(message: string, lower: string) {
  const mentionsPolitics = POLITICAL_ABBR_PATTERN.test(message) || includesAny(lower, POLITICAL_PHRASES);
  if (!mentionsPolitics) return false;
  return !includesAny(lower, CIVIC_ISSUE_NOUNS);
}

// "banter" — off-topic, non-civic chit-chat (entertainment gossip, sports,
// casual questions). The mock can't hold a real conversation, so it just
// returns a canned engaging line each time; this is only for exercising the
// chat-mode UI locally without a live key.
const BANTER_SIGNALS = [
  "reality show",
  "talent show",
  "singing competition",
  "dance show",
  "celebrity",
  "actor",
  "actress",
  "movie",
  "box office",
  "cricket score",
  "web series",
  "controversy",
  "gossip",
  "trip cost",
  "vacation cost",
  "international trip",
  "holiday plan",
];

const BANTER_REPLIES = [
  "Off the record? Fascinating. On the record, this bench has no jurisdiction over that. What else is on your mind?",
  "The court finds this mildly diverting. Go on — though I promise nothing resembling a verdict.",
  "Justice Jojo has opinions about this too, actually. What's your take?",
];

function includesAny(haystack: string, needles: string[]) {
  return needles.some((needle) => haystack.includes(needle));
}

// A slightly more generous echo of lib/preFilter's heuristic, just so the
// mock path can demonstrate the "spam" branch too without a real key.
function looksLikeSpam(message: string) {
  const words = message.trim().split(/\s+/);
  if (words.length <= 2 && message.trim().length < 20) return true;
  return false;
}

export function mockClassify(message: string): JudgeClassification {
  const lower = message.toLowerCase();

  if (includesAny(lower, RELIGION_TERMS) && includesAny(lower, HOSTILE_TERMS)) {
    return { category: "crisis", verdict_line: "", sub_text: "" };
  }

  if (isGenericPoliticalChatter(message, lower)) {
    return {
      category: "serious",
      verdict_line: "Don't waste our time.",
      sub_text: "This bench doesn't do political theater.",
    };
  }

  if (includesAny(lower, SERIOUS_SIGNALS)) {
    return {
      category: "serious",
      verdict_line: "Don't waste our time.",
      sub_text: "This belongs in front of someone who can actually act on it.",
    };
  }

  if (includesAny(lower, BANTER_SIGNALS)) {
    const reply = BANTER_REPLIES[message.length % BANTER_REPLIES.length]!;
    return { category: "banter", verdict_line: reply, sub_text: "" };
  }

  if (looksLikeSpam(message)) {
    return { category: "spam", verdict_line: "", sub_text: "" };
  }

  return {
    category: "minor",
    verdict_line: "Case dismissed. Filed under 'everyone already knows.'",
    sub_text: "This court has seen worse before breakfast.",
  };
}
