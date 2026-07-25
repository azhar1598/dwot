import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { cheapPreFilter } from "@/lib/preFilter";
import { draftLetterWithGemini, isGeminiConfigured, type LetterContext } from "@/lib/letterDrafting";
import { mockDraftLetter } from "@/lib/mockLetter";
import type { LetterApiResponse } from "@/types/representative";

export const runtime = "nodejs";

const MAX_COMPLAINT_LENGTH = 500;
const MAX_NAME_LENGTH = 120;
const MAX_LOCATION_FIELD_LENGTH = 100;

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function errorResponse(message: string, status: number) {
  const body: LetterApiResponse = { error: message };
  return NextResponse.json(body, { status });
}

function parseCategory(value: unknown): "minor" | "serious" | null {
  if (value === "serious") return "serious";
  if (value === "minor") return "minor";
  return null;
}

function parseRepresentativePosition(value: unknown): "MP" | "MLA" | undefined {
  if (value === "MP" || value === "MLA") return value;
  return undefined;
}

function truncatedString(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseLocation(value: unknown): LetterContext["location"] {
  if (typeof value !== "object" || value === null) return undefined;
  const loc = value as Record<string, unknown>;
  const state = truncatedString(loc.state, MAX_LOCATION_FIELD_LENGTH);
  const district = truncatedString(loc.district, MAX_LOCATION_FIELD_LENGTH);
  const constituency = truncatedString(loc.constituency, MAX_LOCATION_FIELD_LENGTH);
  if (!state && !district && !constituency) return undefined;
  return { state, district, constituency };
}

function parseLetterContext(record: Record<string, unknown>): LetterContext | { error: string } {
  const complaint = typeof record.complaint === "string" ? record.complaint.trim() : "";
  if (!complaint) return { error: "Nothing to draft a letter from." };
  if (complaint.length > MAX_COMPLAINT_LENGTH) return { error: "Complaint is too long." };

  const category = parseCategory(record.category);
  if (!category) return { error: "Only minor or serious complaints get a letter." };

  if (cheapPreFilter(complaint) === "spam") return { error: "Doesn't look like a real complaint." };

  return {
    complaint,
    category,
    representativeName: truncatedString(record.representativeName, MAX_NAME_LENGTH) || undefined,
    representativePosition: parseRepresentativePosition(record.representativePosition),
    location: parseLocation(record.location),
  };
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  const rate = checkRateLimit(`letter:${ip}`, { maxRequests: 8 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many letter requests. Try again in a bit." } satisfies LetterApiResponse,
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request.", 400);
  }

  if (typeof body !== "object" || body === null) {
    return errorResponse("Invalid request.", 400);
  }

  const parsed = parseLetterContext(body as Record<string, unknown>);
  if ("error" in parsed) {
    return errorResponse(parsed.error, 400);
  }

  try {
    if (isGeminiConfigured()) {
      const result = await draftLetterWithGemini(parsed);
      return NextResponse.json({ ...result, source: "gemini" } satisfies LetterApiResponse);
    }

    const mockResult = mockDraftLetter(parsed);
    return NextResponse.json({ ...mockResult, source: "mock" } satisfies LetterApiResponse);
  } catch (err) {
    console.error("[letter] drafting failed:", err instanceof Error ? err.message : err);
    return errorResponse("Couldn't draft a letter right now. Try again shortly.", 502);
  }
}
