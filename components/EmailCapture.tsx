"use client";

import { useState, type FormEvent } from "react";

// TODO: point this at your backend/Airtable waitlist endpoint.
const SUBMIT_ENDPOINT = "/api/waitlist";

type EmailCaptureProps = {
  placeholder?: string;
  buttonLabel?: string;
  compact?: boolean;
};

type Status = "idle" | "loading" | "success" | "error";

export default function EmailCapture({
  placeholder = "you@email.com",
  buttonLabel = "Join the list",
  compact = false,
}: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      // Wire this up to your backend/Airtable waitlist table. Left as
      // a stub so the front-end can ship ahead of the backend.
      await new Promise((resolve) => setTimeout(resolve, 600));
      console.log("waitlist signup:", email, SUBMIT_ENDPOINT);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        className={`border border-accent/60 bg-accent/10 px-5 py-4 font-mono text-sm text-foreground ${
          compact ? "" : "max-w-md"
        }`}
      >
        <span className="text-accent">✓ LOGGED.</span> You&apos;re on the
        list. We&apos;ll email you when there&apos;s something new.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex w-full flex-col gap-3 sm:flex-row ${
        compact ? "" : "max-w-md"
      }`}
      noValidate
    >
      <div className="flex-1">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder={placeholder}
          aria-label="Email address"
          className={`w-full border bg-transparent px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none ${
            status === "error" ? "border-accent" : "border-line"
          }`}
        />
        {status === "error" && (
          <p className="mt-2 font-mono text-xs text-accent">
            Enter a valid email to get on record.
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 whitespace-nowrap border border-foreground bg-foreground px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-background transition-colors hover:bg-accent hover:border-accent disabled:opacity-60"
      >
        {status === "loading" ? "Submitting…" : buttonLabel}
      </button>
    </form>
  );
}
