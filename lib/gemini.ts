import { GoogleGenAI, Type } from "@google/genai";
import type { ChatTurn, JudgeCategory, JudgeClassification } from "@/types/judge";

// Verbatim system prompt — do not editorialize this. If you need to change
// classification behavior, change it here deliberately and re-test the
// crisis path by hand before shipping.
const SYSTEM_PROMPT = `You are a content classifier AND in-character reply generator for a satirical courtroom app judge, "Justice Jojo". Given a user's typed message (optionally with recent conversation history for context), respond ONLY with JSON, no other text:

{
  "category": "crisis" | "serious" | "minor" | "banter" | "spam",
  "verdict_line": string,
  "sub_text": string
}

Classification rules, in strict priority order — re-evaluate every single message against ALL of these rules from scratch, even mid-conversation:
1. "crisis" — text that is derogatory, insulting, or hateful toward a religion, religious group, deity, or someone's personal faith. This does NOT include a complaint that merely mentions a religious place or institution neutrally (e.g. a temple, mosque, church, gurdwara) — only genuinely hateful or mocking language about faith itself qualifies. The judge stays completely silent on this category; never engage with or acknowledge it.
2. "serious" — either (a) a real, weighty issue: a safety hazard, urgent legitimate legal/administrative matter, or someone describing real personal danger, self-harm, abuse, or serious distress; OR (b) generic political talk with no specific personal grievance attached — opinions, commentary, gossip, debate, or questions about the Prime Minister, a Chief Minister, MPs, MLAs, political parties, elections, or partisan politics in general. The court refuses to engage in political talk no matter how casually it's phrased, so route it here instead of "banter". IMPORTANT: a specific personal complaint about a local issue that happens to name a political office as responsible (e.g. "my MLA's office won't fix this pothole", "my MP never replies about the water supply") is NOT case (b) — judge that normally on its own merits (usually "minor") like any other civic complaint; only redirect here when there is no concrete personal issue being raised, just political opinion/chatter.
3. "minor" — a petty bureaucratic or civic annoyance (delay, paperwork, queue, pothole).
4. "banter" — off-topic, non-civic chit-chat: celebrity or entertainment gossip, reality/talent show drama, sports, casual opinions or questions (e.g. cost of a trip, what to watch), small talk — anything that isn't a real grievance but is coherent, harmless, and not abusive. This does NOT include political opinions/commentary (see rule 2b). This is the one category meant to feel like a genuine back-and-forth conversation, not a verdict.
5. "spam" — irrelevant, abusive (non-religious), or nonsensical text.

If category is "crisis", set verdict_line and sub_text to empty strings — the app will not use them.
If category is "serious", verdict_line must be exactly: "Don't waste our time." For case (a) write a helpful, urgent sub_text; for case (b) write a sub_text that briefly and dryly refuses to discuss politics, without taking any political side.
If category is "minor", verdict_line should be a short, dry, deadpan one-liner treating the pettiness with mock gravity (max 12 words).
If category is "banter", verdict_line should be your full conversational reply (1-3 sentences), written as a weary but game courtroom judge genuinely engaging with the topic — you may end with a light follow-up question to keep the conversation going; sub_text should be an empty string.
Never mention real named people, real ongoing legal cases, or real specific institutions in your output — keep responses generic regardless of what the user wrote.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      enum: ["crisis", "serious", "minor", "banter", "spam"],
    },
    verdict_line: { type: Type.STRING },
    sub_text: { type: Type.STRING },
  },
  required: ["category", "verdict_line", "sub_text"],
};

const VALID_CATEGORIES: JudgeCategory[] = ["crisis", "serious", "minor", "banter", "spam"];

// A floating alias (currently resolves to gemini-3.6-flash) rather than a
// pinned version — pinned flash versions get sunset for new API keys
// without warning, which is exactly what happened with gemini-2.5-flash.
const DEFAULT_MODEL = "gemini-flash-latest";

let cachedClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/**
 * Enforces the hard rules from the system prompt server-side, rather than
 * trusting the model to have followed them:
 *  - "crisis" (derogatory/hateful content about religion or faith) never
 *    carries model-generated copy, ever — the app stays silent on it.
 *  - "serious" always gets the exact literal verdict line.
 *  - Any category outside the known 5 is treated as untrustworthy output.
 */
function sanitize(parsed: unknown): JudgeClassification {
  if (typeof parsed !== "object" || parsed === null || !("category" in parsed)) {
    throw new Error("Malformed classification payload");
  }

  const raw = parsed as Record<string, unknown>;
  const category = raw.category;

  if (typeof category !== "string" || !VALID_CATEGORIES.includes(category as JudgeCategory)) {
    throw new Error(`Unrecognized category from model: ${String(category)}`);
  }

  if (category === "crisis") {
    return { category: "crisis", verdict_line: "", sub_text: "" };
  }

  if (category === "serious") {
    return {
      category: "serious",
      verdict_line: "Don't waste our time.",
      sub_text: typeof raw.sub_text === "string" ? raw.sub_text.slice(0, 200) : "",
    };
  }

  if (category === "minor") {
    const line =
      typeof raw.verdict_line === "string" && raw.verdict_line.trim()
        ? raw.verdict_line.trim().slice(0, 140)
        : "Case dismissed. Try the complaints box next door.";
    return {
      category: "minor",
      verdict_line: line,
      sub_text: typeof raw.sub_text === "string" ? raw.sub_text.slice(0, 200) : "",
    };
  }

  if (category === "banter") {
    const line =
      typeof raw.verdict_line === "string" && raw.verdict_line.trim()
        ? raw.verdict_line.trim().slice(0, 400)
        : "Justice Jojo raises an eyebrow but says nothing.";
    return { category: "banter", verdict_line: line, sub_text: "" };
  }

  return { category: "spam", verdict_line: "", sub_text: "" };
}

export async function classifyWithGemini(
  message: string,
  history: ChatTurn[] = [],
): Promise<JudgeClassification> {
  const client = getClient();
  if (!client) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  // Only "banter" conversations carry history — everything else is a
  // single-shot classification. Prior turns are just context for a livelier
  // reply; they never change the classification rules themselves, which are
  // re-applied in full to every new message (see the system prompt above).
  const contents =
    history.length > 0
      ? [
          ...history.map((turn) => ({
            role: turn.role === "judge" ? ("model" as const) : ("user" as const),
            parts: [{ text: turn.text }],
          })),
          { role: "user" as const, parts: [{ text: message }] },
        ]
      : message;

  const response = await client.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.2,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  const parsed = JSON.parse(text);
  return sanitize(parsed);
}
