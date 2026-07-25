"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/hooks/useTrialChat";
import TickingLogo from "./TickingLogo";

function JudgeAvatar() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-background text-foreground">
      <TickingLogo className="h-4 w-4" title="Justice Jojo" />
    </span>
  );
}

type ChatThreadProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  onReset: () => void;
};

export default function ChatThread({ messages, isLoading, onReset }: ChatThreadProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isLoading]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Off the record with Justice Jojo
        </span>
        <button
          type="button"
          onClick={onReset}
          className="font-mono text-xs uppercase tracking-widest text-accent hover:text-foreground"
        >
          New case →
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "judge" && <JudgeAvatar />}
            <div
              className={`max-w-[80%] border px-4 py-2.5 font-mono text-sm leading-relaxed ${
                m.role === "user"
                  ? "border-foreground/40 bg-foreground/5 text-foreground"
                  : "border-line bg-background-raised text-foreground"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-end justify-start gap-2">
            <JudgeAvatar />
            <div className="max-w-[80%] border border-line bg-background-raised px-4 py-2.5 font-mono text-sm text-muted">
              …thinking…
            </div>
          </div>
        )}
      </div>

      <div ref={endRef} />
    </div>
  );
}
