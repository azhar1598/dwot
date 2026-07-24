export type JudgeCategory = "crisis" | "serious" | "minor" | "banter" | "spam";

export type JudgeClassification = {
  category: JudgeCategory;
  verdict_line: string;
  sub_text: string;
};

/**
 * A single prior turn in an ongoing "banter" conversation, sent back to the
 * classifier so replies stay contextual. Client-supplied and therefore not
 * trusted as-is — the server caps how many turns it accepts and every new
 * message is independently reclassified against the full priority list
 * (crisis first) regardless of what history claims happened before.
 */
export type ChatTurn = {
  role: "user" | "judge";
  text: string;
};

/** Which classifier produced the result. "mock" must never be trusted for real safety decisions. */
export type ClassificationSource = "gemini" | "mock";

export type JudgeSuccessResponse = JudgeClassification & {
  source: ClassificationSource;
};

export type JudgeErrorResponse = {
  category: "error";
  message: string;
};

export type JudgeApiResponse = JudgeSuccessResponse | JudgeErrorResponse;
