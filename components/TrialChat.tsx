"use client";

import CourtroomQueue from "./CourtroomQueue";
import { useJudgeChat, MAX_COMPLAINT_LENGTH } from "@/hooks/useJudgeChat";

export default function TrialChat() {
  const {
    message,
    setMessage,
    status,
    result,
    requestId,
    apiError,
    isMock,
    handleSubmit,
    handleReset,
  } = useJudgeChat();

  const isCrisis = result?.category === "crisis";

  return (
    <div className="flex flex-1 flex-col">
      <div
        className={`flex min-h-[70vh] flex-col items-center justify-center px-6 py-8 ${
          isCrisis ? "" : "pb-40 sm:pb-36"
        }`}
      >
        <div className="w-full max-w-md">
          <CourtroomQueue result={result} requestId={requestId} onReset={handleReset} />
        </div>
      </div>

      {!isCrisis && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-background-raised">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-4 py-4 sm:px-6">
            {isMock && (
              <p className="font-mono text-[11px] text-calm">
                Demo mode — no GEMINI_API_KEY configured. Showing a placeholder classifier.
              </p>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label htmlFor="trial-message" className="sr-only">
                Your complaint
              </label>
              <textarea
                id="trial-message"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_COMPLAINT_LENGTH))}
                rows={1}
                placeholder="State your case…"
                disabled={status === "loading"}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                className="w-full flex-1 resize-none border border-line bg-transparent px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === "loading" || !message.trim()}
                className="shrink-0 whitespace-nowrap border border-foreground bg-foreground px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-background transition-colors hover:border-accent hover:bg-accent disabled:opacity-50"
              >
                {status === "loading" ? "Filing…" : "State your case"}
              </button>
            </form>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted">
                {message.length}/{MAX_COMPLAINT_LENGTH}
              </span>
              {apiError && (
                <span className="font-mono text-xs text-accent">{apiError}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
