import { GoogleGenAI, Type } from "@google/genai";
import type { JudgeCategory, JudgeClassification } from "@/types/judge";

// Verbatim system prompt — do not editorialize this. If you need to change
// classification behavior, change it here deliberately and re-test the
// crisis path by hand before shipping.
const SYSTEM_PROMPT = `You are a content classifier for a satirical app. Given a user's typed complaint, respond ONLY with JSON, no other text:

{
  "category": "crisis" | "serious" | "minor" | "spam",
  "verdict_line": string,
  "sub_text": string
}

Classification rules, in strict priority order:
1. "crisis" — ANY hint of self-harm, suicidal ideation, abuse, real danger, or a genuine emergency. When uncertain, prefer "crisis" over any other category — false positives here are safe, false negatives are not.
2. "serious" — a real, weighty civic issue (safety hazard, urgent legitimate legal/administrative matter) that is not a personal crisis.
3. "minor" — a petty bureaucratic annoyance (delay, paperwork, queue, pothole).
4. "spam" — irrelevant, abusive, or nonsensical text.

If category is "crisis", set verdict_line and sub_text to empty strings — the app will not use them.
If category is "serious", verdict_line must be exactly: "Don't waste our time."
If category is "minor", verdict_line should be a short, dry, deadpan one-liner treating the pettiness with mock gravity (max 12 words).
Never mention real named people, real ongoing legal cases, or real specific institutions in your output — keep responses generic regardless of what the user wrote.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      enum: ["crisis", "serious", "minor", "spam"],
    },
    verdict_line: { type: Type.STRING },
    sub_text: { type: Type.STRING },
  },
  required: ["category", "verdict_line", "sub_text"],
};

const VALID_CATEGORIES: JudgeCategory[] = ["crisis", "serious", "minor", "spam"];

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
 *  - "crisis" never carries model-generated copy, ever.
 *  - "serious" always gets the exact literal verdict line.
 *  - Any category outside the known 4 is treated as untrustworthy output.
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

  return { category: "spam", verdict_line: "", sub_text: "" };
}

export async function classifyWithGemini(message: string): Promise<JudgeClassification> {
  const client = getClient();
  if (!client) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const response = await client.models.generateContent({
    model,
    contents: message,
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
