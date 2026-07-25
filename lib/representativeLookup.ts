import { GoogleGenAI, Type } from "@google/genai";
import type {
  Representative,
  RepresentativeLocation,
  RepresentativeLookupResult,
} from "@/types/representative";

// This prompt is deliberately paranoid about hallucination. Officeholders
// change with elections and "plausible-looking" official emails are exactly
// the kind of thing an LLM will confidently invent. The frontend never
// trusts this output blindly either — every field it returns stays editable
// before it's used in a mailto: link.
const SYSTEM_PROMPT = `You help a citizen in India identify their elected representatives so they can send a grievance letter. Given a State, District, and Constituency (free text, possibly informal, incomplete, or misspelled), respond ONLY with JSON, no other text:

{
  "representatives": [
    {
      "name": string,
      "position": "MP" | "MLA",
      "party": string or null,
      "email": string or null,
      "confidence": "high" | "medium" | "low"
    }
  ],
  "note": string
}

Rules:
- Try to identify both the Lok Sabha MP and the state assembly MLA for the area described, as separate entries, when you can determine the correct constituency.
- Only report a name if you have reasonable confidence about who CURRENTLY holds that seat. Terms end and elections happen — if you are unsure whether your information is current, set "confidence" to "low" and say so plainly in "note".
- NEVER invent a specific-looking email address unless you are genuinely confident it is a real, current, public official address. If you don't know one, set "email" to null — do not guess or construct one from a name pattern.
- If you cannot confidently identify the constituency or representative at all, return an empty "representatives" array. An honest empty answer is far better than a confident wrong one.
- "note" must be 1-2 short sentences, written directly to the citizen, reminding them to verify this information themselves before sending anything.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    representatives: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          position: { type: Type.STRING, enum: ["MP", "MLA"] },
          party: { type: Type.STRING, nullable: true },
          email: { type: Type.STRING, nullable: true },
          confidence: { type: Type.STRING, enum: ["high", "medium", "low"] },
        },
        required: ["name", "position", "confidence"],
      },
    },
    note: { type: Type.STRING },
  },
  required: ["representatives", "note"],
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

// Deliberately avoids regex here — this validates untrusted LLM output, and
// a hand-rolled linear scan sidesteps any catastrophic-backtracking risk.
function sanitizeEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 200 || trimmed.includes(" ")) return null;

  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0 || atIndex === trimmed.length - 1) return null;
  if (trimmed.slice(atIndex + 1).includes("@")) return null;

  const domain = trimmed.slice(atIndex + 1);
  const dotIndex = domain.indexOf(".");
  if (dotIndex <= 0 || dotIndex === domain.length - 1) return null;

  return trimmed;
}

function sanitize(parsed: unknown): RepresentativeLookupResult {
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Malformed representative lookup payload");
  }

  const raw = parsed as Record<string, unknown>;
  const rawReps = Array.isArray(raw.representatives) ? raw.representatives : [];

  const representatives: Representative[] = rawReps
    .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
    .map((r) => {
      const position = r.position === "MLA" ? "MLA" : "MP";
      const confidence =
        r.confidence === "high" || r.confidence === "medium" || r.confidence === "low"
          ? r.confidence
          : "low";
      return {
        name: typeof r.name === "string" ? r.name.trim().slice(0, 120) : "Unknown",
        position,
        party: typeof r.party === "string" && r.party.trim() ? r.party.trim().slice(0, 80) : null,
        email: sanitizeEmail(r.email),
        confidence,
      } satisfies Representative;
    })
    .slice(0, 4);

  const note =
    typeof raw.note === "string" && raw.note.trim()
      ? raw.note.trim().slice(0, 400)
      : "AI-generated best guess. Please verify before sending anything.";

  return { representatives, note };
}

export async function lookupRepresentatives(
  location: RepresentativeLocation,
): Promise<RepresentativeLookupResult> {
  const client = getClient();
  if (!client) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const prompt = `State: ${location.state}\nDistrict: ${location.district}\nConstituency: ${location.constituency}`;

  const response = await client.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.1,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  const parsed = JSON.parse(text);
  return sanitize(parsed);
}
