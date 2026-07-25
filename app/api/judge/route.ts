import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { cheapPreFilter } from "@/lib/preFilter";
import { classifyWithGemini, isGeminiConfigured } from "@/lib/gemini";
import { mockClassify } from "@/lib/mockClassifier";
import type { ChatTurn, JudgeApiResponse } from "@/types/judge";

export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 500;

// "banter" conversations send prior turns back for context. This is
// client-supplied and therefore untrusted — capped short both to bound
// token/cost and because a malicious client could otherwise spoof fake
// "judge" turns to try to steer future replies. It's context only: every
// message, history or not, is independently reclassified against the full
// priority list server-side (see lib/gemini.ts).
const MAX_HISTORY_TURNS = 8;

function parseHistory(body: Record<string, unknown>): ChatTurn[] {
  const raw = body.history;
  if (!Array.isArray(raw)) return [];

  const turns: ChatTurn[] = [];
  for (const entry of raw.slice(-MAX_HISTORY_TURNS)) {
    if (typeof entry !== "object" || entry === null) continue;
    const { role, text } = entry as { role?: unknown; text?: unknown };
    if ((role !== "user" && role !== "judge") || typeof text !== "string") continue;
    turns.push({ role, text: text.slice(0, MAX_MESSAGE_LENGTH) });
  }
  return turns;
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// Deliberately logs only the category — never the raw submission — so we
// can monitor how often each category fires (e.g. how often "crisis" —
// derogatory/hateful content about religion or faith — is being caught)
// without retaining anyone's actual text.
function logClassification(category: string, source: string) {
  console.log(
    `[judge] ${new Date().toISOString()} category=${category} source=${source}`,
  );
}

function errorResponse(message: string, status: number) {
  const body: JudgeApiResponse = { category: "error", message };
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      { category: "error", message: "Too many submissions. Try again in a bit." } satisfies JudgeApiResponse,
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request.", 400);
  }

  const bodyObj = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};

  const message =
    "message" in bodyObj && typeof bodyObj.message === "string" ? bodyObj.message.trim() : "";

  if (!message) {
    return errorResponse("Type something first.", 400);
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return errorResponse(`Keep it under ${MAX_MESSAGE_LENGTH} characters.`, 400);
  }

  const history = parseHistory(bodyObj);

  // Cheap first pass — catches obvious junk without spending an LLM call.
  // Never the primary safety layer; anything with real content skips this
  // and always goes to the real classifier below.
  if (cheapPreFilter(message) === "spam") {
    logClassification("spam", "prefilter");
    return NextResponse.json({
      category: "spam",
      verdict_line: "",
      sub_text: "",
      source: "gemini",
    } satisfies JudgeApiResponse);
  }

  try {
    if (isGeminiConfigured()) {
      const result = await classifyWithGemini(message, history);
      logClassification(result.category, "gemini");
      return NextResponse.json({ ...result, source: "gemini" } satisfies JudgeApiResponse);
    }

    console.warn(
      "[judge] GEMINI_API_KEY is not set — falling back to the MOCK classifier. " +
        "This is a keyword heuristic for local UI testing only and is NOT a safety system. " +
        "Set GEMINI_API_KEY before deploying.",
    );
    const mockResult = mockClassify(message);
    logClassification(mockResult.category, "mock");
    return NextResponse.json({ ...mockResult, source: "mock" } satisfies JudgeApiResponse);
  } catch (err) {
    console.error("[judge] classification failed:", err instanceof Error ? err.message : err);
    return errorResponse("Something went wrong. Try again in a moment.", 502);
  }
}
