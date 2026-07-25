import { formatLocation, formatRecipient, type LetterContext } from "./letterDrafting";
import type { LetterDraft } from "@/types/representative";

// Dev-only template used when GEMINI_API_KEY isn't set, so the letter step
// of the flow is still testable locally.
export function mockDraftLetter(context: LetterContext): LetterDraft {
  const recipient = formatRecipient(context.representativeName, context.representativePosition);
  const location = formatLocation(context.location);

  return {
    subject: "Grievance: civic issue requiring attention",
    body: `Dear ${recipient},

I am writing to bring to your attention the following issue affecting our community${location ? ` in ${location}` : ""}: ${context.complaint.trim()}

I request that this matter be looked into and addressed at the earliest opportunity. I would appreciate a response outlining the steps being taken.

Sincerely,
`,
  };
}
