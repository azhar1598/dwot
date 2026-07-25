export type RepresentativeLocation = {
  state: string;
  district: string;
  constituency: string;
};

export type RepresentativeConfidence = "high" | "medium" | "low";

export type Representative = {
  name: string;
  position: "MP" | "MLA";
  party: string | null;
  email: string | null;
  confidence: RepresentativeConfidence;
};

export type RepresentativeLookupResult = {
  representatives: Representative[];
  note: string;
};

export type RepresentativeSuccessResponse = RepresentativeLookupResult & {
  source: "gemini" | "mock";
};

export type RepresentativeErrorResponse = {
  error: string;
};

export type RepresentativeApiResponse =
  | RepresentativeSuccessResponse
  | RepresentativeErrorResponse;

export type LetterDraft = {
  subject: string;
  body: string;
};

export type LetterSuccessResponse = LetterDraft & {
  source: "gemini" | "mock";
};

export type LetterErrorResponse = {
  error: string;
};

export type LetterApiResponse = LetterSuccessResponse | LetterErrorResponse;
