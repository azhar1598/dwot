import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { cheapPreFilter } from "@/lib/preFilter";
import { classifyWithGemini, isGeminiConfigured } from "@/lib/gemini";
import { mockClassify } from "@/lib/mockClassifier";
import type { JudgeApiResponse } from "@/types/judge";

export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 500;

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// Deliberately logs only the category — never the raw submission — so we
// can monitor how often "crisis" fires (to review/improve the fixed
// crisis-response copy over time) without retaining anyone's actual text.
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

  const message =
    typeof body === "object" && body !== null && "message" in body && typeof (body as { message: unknown }).message === "string"
      ? (body as { message: string }).message.trim()
      : "";

  if (!message) {
    return errorResponse("Type something first.", 400);
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return errorResponse(`Keep it under ${MAX_MESSAGE_LENGTH} characters.`, 400);
  }

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
      const result = await classifyWithGemini(message);
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
