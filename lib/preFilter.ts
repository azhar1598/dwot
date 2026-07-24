// A cheap, structural first pass — NOT the safety layer. This only exists
// to skip an LLM call for obvious junk (empty, one-character mashing,
// pure insults) so we're not paying for a classification on garbage input.
//
// This must never be relied on for safety. It is deliberately narrow and
// anchored to whole-message patterns so it can't accidentally swallow a
// message that also contains real distress signals — anything with actual
// content, however brief, is left to the real classifier.

// Plain word/phrase lookup instead of a regex — this runs on untrusted,
// attacker-controlled input on a public endpoint, so we deliberately avoid
// alternation + nested quantifiers that could open the door to catastrophic
// backtracking (ReDoS).
const PURE_INSULT_PHRASES = new Set([
  "fuck",
  "fuck you",
  "fuckyou",
  "stfu",
  "f off",
  "fuckoff",
  "asshole",
  "idiot",
  "idiot bot",
  "shut up",
  "shutup",
]);

function normalizeForInsultCheck(message: string): string {
  return message
    .toLowerCase()
    .replace(/[!.?]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Catches keyboard mashing / short repeated units, e.g. "asdasdasd",
// "hahaha" — a 1-4 character unit repeated 3+ times in a row, checked with
// plain string slicing (no backreference regex) to keep this O(n).
function isRepeatedUnitSpam(collapsed: string): boolean {
  if (collapsed.length < 6) return false;
  for (let unitLen = 1; unitLen <= 4; unitLen += 1) {
    const unit = collapsed.slice(0, unitLen);
    let repeats = 0;
    let pos = 0;
    while (collapsed.startsWith(unit, pos)) {
      repeats += 1;
      pos += unitLen;
    }
    const covered = repeats * unitLen;
    if (repeats >= 3 && covered >= collapsed.length - 3) return true;
  }
  return false;
}

export function cheapPreFilter(message: string): "spam" | null {
  const trimmed = message.trim();

  if (trimmed.length < 3) return "spam";

  const collapsed = trimmed.toLowerCase().replace(/\s/g, "");

  if (collapsed.length >= 4 && new Set(collapsed).size <= 2) {
    // e.g. "aaaaaa"
    return "spam";
  }

  if (isRepeatedUnitSpam(collapsed)) return "spam";

  if (PURE_INSULT_PHRASES.has(normalizeForInsultCheck(trimmed))) return "spam";

  return null;
}
