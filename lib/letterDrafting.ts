import { GoogleGenAI, Type } from "@google/genai";
import type { LetterDraft } from "@/types/representative";

// Separate, non-satirical prompt for the actual letter that gets sent —
// unlike the judge persona, this one names the real recipient, stays
// formal, and must never joke or use verdict-style language.
const SYSTEM_PROMPT = `You draft short, formal, polite grievance letters from an Indian citizen to their elected representative, based on a complaint they typed casually. Respond ONLY with JSON, no other text:

{
  "subject": string,
  "body": string
}

Rules:
- Rewrite the complaint into formal, respectful, non-vulgar civic language. Remove slang, sarcasm, profanity, and exaggeration — keep the actual facts and request.
- Address the letter to the representative by name and position if given, otherwise use "Dear Sir/Madam" or "To the concerned representative".
- Structure: a brief greeting, 1-2 paragraphs describing the issue and its impact, a clear and specific request for action, and a polite closing asking for a response. End with "Sincerely," followed by a blank line for the citizen's name (do not invent a name).
- Include the constituency/district in the body if provided, so the recipient's office can locate the issue.
- Keep the whole letter under 220 words.
- "subject" must be a short, specific line (under 12 words) summarizing the issue, prefixed with "Grievance:".
- Never add humor, sarcasm, or verdict-style commentary — this is a real letter a real person may send.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING },
    body: { type: Type.STRING },
  },
  required: ["subject", "body"],
};

// See lib/gemini.ts for why this uses the floating alias instead of a
// pinned version.
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

function sanitize(parsed: unknown): LetterDraft {
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Malformed letter payload");
  }
  const raw = parsed as Record<string, unknown>;
  const subject =
    typeof raw.subject === "string" && raw.subject.trim()
      ? raw.subject.trim().slice(0, 150)
      : "Grievance: civic issue requiring attention";
  const body =
    typeof raw.body === "string" && raw.body.trim()
      ? raw.body.trim().slice(0, 2000)
      : "";
  if (!body) {
    throw new Error("Model returned an empty letter body");
  }
  return { subject, body };
}

export type LetterContext = {
  complaint: string;
  category: "minor" | "serious";
  representativeName?: string;
  representativePosition?: "MP" | "MLA";
  location?: { state: string; district: string; constituency: string };
};

export function formatRecipient(name?: string, position?: "MP" | "MLA"): string {
  if (!name) return "Sir/Madam";
  if (!position) return name;
  return `${name} (${position})`;
}

export function formatLocation(location?: LetterContext["location"]): string {
  if (!location) return "";
  return [location.constituency, location.district, location.state].filter(Boolean).join(", ");
}

export async function draftLetterWithGemini(context: LetterContext): Promise<LetterDraft> {
  const client = getClient();
  if (!client) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const lines = [
    `Complaint (casual, as typed by the citizen): ${context.complaint}`,
    `Severity: ${context.category}`,
  ];
  if (context.representativeName) {
    lines.push(`Recipient: ${formatRecipient(context.representativeName, context.representativePosition)}`);
  }
  const locationLine = formatLocation(context.location);
  if (locationLine) {
    lines.push(`Location: ${locationLine}`);
  }

  const response = await client.models.generateContent({
    model,
    contents: lines.join("\n"),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.3,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  const parsed = JSON.parse(text);
  return sanitize(parsed);
}
