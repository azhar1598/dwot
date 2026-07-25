"use client";

import { useEffect, useState } from "react";
import CourtroomQueue from "./CourtroomQueue";
import GrievanceLetter from "./GrievanceLetter";
import { useJudgeChat, MAX_COMPLAINT_LENGTH } from "@/hooks/useJudgeChat";
import type { LetterApiResponse, LetterDraft } from "@/types/representative";
import type { LocationSelection } from "./LocationSelector";

type LetterState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; draft: LetterDraft; isMock: boolean }
  | { status: "error"; message: string };

export default function ChatInput({
  selection,
}: {
  selection?: LocationSelection;
}) {
  const {
    message,
    setMessage,
    status,
    result,
    requestId,
    apiError,
    isMock,
    lastComplaint,
    handleSubmit,
    handleReset: handleChatReset,
  } = useJudgeChat();
  const [letterState, setLetterState] = useState<LetterState>({ status: "idle" });
  const [inputActive, setInputActive] = useState(false);

  // A fresh verdict clears any residual hover/focus from typing the previous
  // complaint (e.g. the mouse never moved after pressing Enter) so the new
  // stamp/verdict is guaranteed visible. Hovering the input again afterwards
  // is then read as a genuine "starting a new case" gesture.
  useEffect(() => {
    setInputActive(false);
  }, [requestId]);

  const isCrisis = result?.category === "crisis";
  const wantsLetter = result?.category === "minor" || result?.category === "serious";

  useEffect(() => {
    // No setState here when the guard fails: every render already gates
    // the letter UI on `wantsLetter`, so a stale non-idle letterState from
    // a previous submission simply won't be shown — no need to reset it.
    if (requestId === 0 || !wantsLetter || !lastComplaint) {
      return;
    }

    let cancelled = false;
    // Deferred so this doesn't count as a synchronous setState-in-effect —
    // matches the pattern used in CourtroomQueue's animation effect.
    setTimeout(() => {
      if (!cancelled) setLetterState({ status: "loading" });
    }, 0);

    fetch("/api/letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        complaint: lastComplaint,
        category: result?.category,
        representativeName: selection?.representative?.name,
        representativePosition: selection?.representative?.position,
        location: selection?.location ?? undefined,
      }),
    })
      .then(async (res) => {
        const data: LetterApiResponse = await res.json();
        if (cancelled) return;
        if (!res.ok || "error" in data) {
          setLetterState({
            status: "error",
            message: "error" in data ? data.error : "Couldn't draft a letter.",
          });
          return;
        }
        setLetterState({ status: "done", draft: data, isMock: data.source === "mock" });
      })
      .catch(() => {
        if (!cancelled) {
          setLetterState({ status: "error", message: "Couldn't reach the letter drafter." });
        }
      });

    return () => {
      cancelled = true;
    };
    // Only re-run when a new submission comes in — representative/location
    // edits alone shouldn't trigger a re-draft of the current letter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  function handleReset() {
    handleChatReset();
    setLetterState({ status: "idle" });
  }

  return (
    <div className="flex flex-col gap-6">
      {isMock && (
        <div className="border border-calm/60 bg-calm/10 px-4 py-2 font-mono text-xs text-calm">
          Demo mode — no GEMINI_API_KEY configured. Showing a placeholder
          classifier, not real safety detection.
        </div>
      )}

      {!isCrisis && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label htmlFor="complaint-message" className="font-mono text-xs uppercase tracking-widest text-muted">
            State your case
          </label>
          <textarea
            id="complaint-message"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_COMPLAINT_LENGTH))}
            rows={3}
            placeholder="The ward office has had my file for eleven months..."
            disabled={status === "loading"}
            onMouseEnter={() => setInputActive(true)}
            onMouseLeave={() => setInputActive(false)}
            onFocus={() => setInputActive(true)}
            onBlur={() => setInputActive(false)}
            className="w-full resize-none border border-line bg-transparent px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none disabled:opacity-60"
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-muted">
              {message.length}/{MAX_COMPLAINT_LENGTH}
            </span>
            <button
              type="submit"
              disabled={status === "loading" || !message.trim()}
              className="border border-foreground bg-foreground px-6 py-2.5 font-mono text-sm font-bold uppercase tracking-wider text-background transition-colors hover:border-accent hover:bg-accent disabled:opacity-50"
            >
              {status === "loading" ? "Filing…" : "File the complaint"}
            </button>
          </div>
          {apiError && (
            <p className="font-mono text-xs text-accent">{apiError}</p>
          )}
        </form>
      )}

      <CourtroomQueue
        result={result}
        requestId={requestId}
        onReset={handleReset}
        errored={!!apiError}
        anticipate={inputActive}
        submitting={status === "loading"}
      />

      {wantsLetter && letterState.status === "loading" && (
        <p className="font-mono text-xs text-muted">Drafting a formal letter…</p>
      )}
      {wantsLetter && letterState.status === "error" && (
        <p className="font-mono text-xs text-accent">{letterState.message}</p>
      )}
      {wantsLetter && letterState.status === "done" && (
        <GrievanceLetter
          key={requestId}
          draft={letterState.draft}
          isMock={letterState.isMock}
          recipientName={selection?.representative?.name ?? ""}
          recipientEmail={selection?.representative?.email ?? ""}
        />
      )}
    </div>
  );
}
