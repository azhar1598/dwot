import type { JudgeClassification } from "@/types/judge";

// DEV-ONLY FALLBACK. Used only when GEMINI_API_KEY is not configured, so the
// UI/animation flow can be exercised locally without a live key.
//
// This is a keyword heuristic, not a safety system. It must NEVER ship to
// production and must NEVER be treated as real crisis detection — it exists
// purely so the four visual branches can be clicked through during
// development. The route handler logs a loud warning whenever this runs.

const CRISIS_SIGNALS = [
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

  if (includesAny(lower, CRISIS_SIGNALS)) {
    return { category: "crisis", verdict_line: "", sub_text: "" };
  }

  if (includesAny(lower, SERIOUS_SIGNALS)) {
    return {
      category: "serious",
      verdict_line: "Don't waste our time.",
      sub_text: "This belongs in front of someone who can actually act on it.",
    };
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
