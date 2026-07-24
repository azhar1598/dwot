"use client";

import { useState, type FormEvent } from "react";
import type { JudgeApiResponse, JudgeClassification } from "@/types/judge";

export const MAX_COMPLAINT_LENGTH = 500;

export type SubmitStatus = "idle" | "loading";

export function useJudgeChat() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [result, setResult] = useState<JudgeClassification | null>(null);
  const [requestId, setRequestId] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [lastComplaint, setLastComplaint] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = message.trim();
    if (!trimmed || status === "loading") return;

    setStatus("loading");
    setApiError(null);

    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data: JudgeApiResponse = await res.json();

      if (!res.ok || data.category === "error") {
        setApiError(data.category === "error" ? data.message : "Something went wrong. Try again.");
        setStatus("idle");
        return;
      }

      setIsMock(data.source === "mock");
      setResult({ category: data.category, verdict_line: data.verdict_line, sub_text: data.sub_text });
      setLastComplaint(trimmed);
      setRequestId((id) => id + 1);
      setMessage("");
    } catch {
      setApiError("Couldn't reach the court. Check your connection and try again.");
    } finally {
      setStatus("idle");
    }
  }

  function handleReset() {
    setResult(null);
    setApiError(null);
  }

  return {
    message,
    setMessage,
    status,
    result,
    requestId,
    apiError,
    isMock,
    lastComplaint,
    handleSubmit,
    handleReset,
  };
}
