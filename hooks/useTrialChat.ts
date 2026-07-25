"use client";

import { useRef, useState, type FormEvent } from "react";
import type { ChatTurn, JudgeApiResponse, JudgeSuccessResponse } from "@/types/judge";
import { MAX_COMPLAINT_LENGTH } from "./useJudgeChat";

export { MAX_COMPLAINT_LENGTH };

export type TrialMode = "case" | "chat";

export type ChatMessage = {
  id: number;
  role: "user" | "judge";
  text: string;
};

// Same silent-on-crisis rule as the single-shot courtroom flow (see
// useJudgeChat.ts) — a message that's genuinely hateful about religion or
// faith gets no reply at all, in either mode, and never joins the transcript.
const STAY_SILENT_ON_CRISIS = true;

// How many prior turns we send back to Gemini for banter continuity. See
// app/api/judge/route.ts for why this is capped and treated as untrusted.
const MAX_HISTORY_TURNS = 8;

export type SubmitStatus = "idle" | "loading";

function chatReplyFor(data: JudgeSuccessResponse): string {
  if (data.category === "spam") return "That doesn't land as a real point. Try again?";
  return [data.verdict_line, data.sub_text].filter(Boolean).join(" ") || "Noted.";
}

export function useTrialChat() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  // "case" = the original single-shot animated verdict flow. "banter"
  // replies switch this to "chat" (a real back-and-forth thread), which
  // persists until either the user hits reset or a "serious" issue comes up
  // mid-chat — that escalates straight back to "case" with a stamped ruling.
  const [mode, setMode] = useState<TrialMode>("case");
  const [result, setResult] = useState<JudgeSuccessResponse | null>(null);
  const [requestId, setRequestId] = useState(0);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const idCounter = useRef(0);

  function nextId() {
    idCounter.current += 1;
    return idCounter.current;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = message.trim();
    if (!trimmed || status === "loading") return;

    // Captured once, up front — `mode` itself may change partway through
    // this function (e.g. a "banter" reply flips it to "chat"), but whether
    // we were ALREADY chatting when the user hit send is what decides
    // whether their message can be shown immediately (see below).
    const wasAlreadyChatting = mode === "chat";

    setStatus("loading");
    setApiError(null);
    setMessage("");

    // Show the user's own message in the thread right away instead of
    // waiting for the judge's reply — otherwise it just sits invisible in
    // the composer while "…thinking…" appears, which reads as if nothing
    // was sent yet. Only possible once there's already a thread to post
    // into; the very first message (still in "case" mode) doesn't have one
    // until the classification comes back and decides whether to open one.
    if (wasAlreadyChatting) {
      setHistory((prev) => [...prev, { id: nextId(), role: "user", text: trimmed }]);
    }

    const historyForApi: ChatTurn[] = wasAlreadyChatting
      ? history.slice(-MAX_HISTORY_TURNS).map((m) => ({ role: m.role, text: m.text }))
      : [];

    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          ...(historyForApi.length ? { history: historyForApi } : {}),
        }),
      });

      const data: JudgeApiResponse = await res.json();

      if (!res.ok || data.category === "error") {
        setApiError(data.category === "error" ? data.message : "Something went wrong. Try again.");
        return;
      }

      setIsMock(data.source === "mock");

      if (STAY_SILENT_ON_CRISIS && data.category === "crisis") {
        // Stays silent by design — if the user's message was already shown
        // (mid-chat), it's left standing with no reply rather than yanked
        // back out, which would look like a glitch.
        return;
      }

      // A "serious" issue raised mid-chat ends the conversation on the spot
      // and drops straight into the same stamped, animated ruling a serious
      // complaint gets outside of chat — the bit stops the moment it's real.
      if (wasAlreadyChatting && data.category === "serious") {
        setMode("case");
        setHistory([]);
        setResult(data);
        setRequestId((id) => id + 1);
        return;
      }

      // "banter" always enters/continues the chat thread. Once already
      // chatting, every other reply (minor/spam) stays a chat bubble instead
      // of snapping back to the animated verdict scene — the user has to
      // hit reset (or raise something serious, see above) to leave chat.
      if (wasAlreadyChatting || data.category === "banter") {
        setMode("chat");
        setHistory((prev) => [
          // The user's turn is already in there for an ongoing chat (added
          // optimistically above); only add it here for the first message
          // that switches "case" mode into "chat" mode.
          ...(wasAlreadyChatting ? prev : [...prev, { id: nextId(), role: "user" as const, text: trimmed }]),
          { id: nextId(), role: "judge", text: chatReplyFor(data) },
        ]);
        return;
      }

      setResult(data);
      setRequestId((id) => id + 1);
    } catch {
      setApiError("Couldn't reach the court. Check your connection and try again.");
    } finally {
      setStatus("idle");
    }
  }

  function handleReset() {
    setResult(null);
    setApiError(null);
    setMode("case");
    setHistory([]);
  }

  return {
    message,
    setMessage,
    status,
    mode,
    result,
    requestId,
    history,
    apiError,
    isMock,
    handleSubmit,
    handleReset,
  };
}
