"use client";

import { useEffect, useState } from "react";
import CourtroomQueue from "./CourtroomQueue";
import ChatThread from "./ChatThread";
import { useTrialChat, MAX_COMPLAINT_LENGTH } from "@/hooks/useTrialChat";

export default function TrialChat() {
  const {
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
  } = useTrialChat();
  const [inputActive, setInputActive] = useState(false);

  // A fresh verdict clears any residual hover/focus from typing the previous
  // complaint (e.g. the mouse never moved after pressing Enter) so the new
  // stamp/verdict is guaranteed visible. Hovering the input again afterwards
  // is then read as a genuine "starting a new case" gesture.
  useEffect(() => {
    setInputActive(false);
  }, [requestId]);

  const isCrisis = result?.category === "crisis";
  const isChat = mode === "chat";

  return (
    <div className="flex flex-1 flex-col">
      <div
        className={`flex min-h-[70vh] flex-col ${isChat ? "justify-end" : "items-center justify-center"} px-6 py-8 ${
          isCrisis ? "" : "pb-40 sm:pb-36"
        }`}
      >
        {isChat ? (
          <ChatThread messages={history} isLoading={status === "loading"} onReset={handleReset} />
        ) : (
          <div className="w-full max-w-md">
            <CourtroomQueue
              result={result}
              requestId={requestId}
              onReset={handleReset}
              errored={!!apiError}
              anticipate={inputActive}
              submitting={status === "loading"}
            />
          </div>
        )}
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
                {isChat ? "Your reply" : "Your complaint"}
              </label>
              <textarea
                id="trial-message"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_COMPLAINT_LENGTH))}
                rows={1}
                placeholder={isChat ? "Reply to the judge…" : "State your case…"}
                disabled={status === "loading"}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                onMouseEnter={() => setInputActive(true)}
                onMouseLeave={() => setInputActive(false)}
                onFocus={() => setInputActive(true)}
                onBlur={() => setInputActive(false)}
                className="w-full flex-1 resize-none border border-line bg-transparent px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === "loading" || !message.trim()}
                className="shrink-0 whitespace-nowrap border border-foreground bg-foreground px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-background transition-colors hover:border-accent hover:bg-accent disabled:opacity-50"
              >
                {status === "loading" ? "Filing…" : isChat ? "Send" : "State your case"}
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
