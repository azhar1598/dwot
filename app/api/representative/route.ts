import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { lookupRepresentatives, isGeminiConfigured } from "@/lib/representativeLookup";
import { mockLookupRepresentatives } from "@/lib/mockRepresentative";
import type { RepresentativeApiResponse } from "@/types/representative";

export const runtime = "nodejs";

const MAX_FIELD_LENGTH = 100;

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function errorResponse(message: string, status: number) {
  const body: RepresentativeApiResponse = { error: message };
  return NextResponse.json(body, { status });
}

function readField(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  const rate = checkRateLimit(`representative:${ip}`, { maxRequests: 10 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many lookups. Try again in a bit." } satisfies RepresentativeApiResponse,
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

  const record = body as Record<string, unknown>;
  const state = readField(record, "state");
  const district = readField(record, "district");
  const constituency = readField(record, "constituency");

  if (!state) {
    return errorResponse("Select a state first.", 400);
  }

  for (const value of [state, district, constituency]) {
    if (value.length > MAX_FIELD_LENGTH) {
      return errorResponse("That field is too long.", 400);
    }
  }

  const location = { state, district, constituency };

  try {
    if (isGeminiConfigured()) {
      const result = await lookupRepresentatives(location);
      return NextResponse.json({ ...result, source: "gemini" } satisfies RepresentativeApiResponse);
    }

    const mockResult = mockLookupRepresentatives(location);
    return NextResponse.json({ ...mockResult, source: "mock" } satisfies RepresentativeApiResponse);
  } catch (err) {
    console.error("[representative] lookup failed:", err instanceof Error ? err.message : err);
    return errorResponse("Couldn't look up representatives right now. Try again shortly.", 502);
  }
}
