import type { RepresentativeLocation, RepresentativeLookupResult } from "@/types/representative";

// Dev-only fallback for local UI testing when GEMINI_API_KEY isn't set.
// Deliberately returns no names/emails — inventing fake officials would be
// worse than being honest that this is a placeholder.
export function mockLookupRepresentatives(
  location: RepresentativeLocation,
): RepresentativeLookupResult {
  return {
    representatives: [],
    note: `Demo mode — no live lookup for ${location.constituency || location.district || location.state}. Enter your representative's details manually below.`,
  };
}
