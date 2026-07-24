export type JudgeCategory = "crisis" | "serious" | "minor" | "spam";

export type JudgeClassification = {
  category: JudgeCategory;
  verdict_line: string;
  sub_text: string;
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
