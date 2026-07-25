"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TickingLogo from "./TickingLogo";

export default function Header() {
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    if (!showAbout) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowAbout(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showAbout]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 text-foreground">
            <TickingLogo className="h-9 w-9 text-foreground" />
            <span className="font-condensed text-xl leading-none tracking-wide">
              DON&apos;T WASTE
              <br />
              OUR TIME
            </span>
          </Link>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setShowAbout(true)}
              aria-label="How Justice Jojo behaves"
              className="text-foreground transition-colors hover:text-accent"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 10.5V17" />
                <circle cx="12" cy="7.2" r="1" fill="currentColor" stroke="none" />
              </svg>
            </button>

            <a
              href="https://www.instagram.com/_dontwasteourtime/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Don't Waste Our Time on Instagram"
              className="text-foreground transition-colors hover:text-accent"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {showAbout && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowAbout(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="justice-jojo-title"
            className="relative w-full max-w-lg border border-line bg-background-raised p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={() => setShowAbout(false)}
              aria-label="Close"
              className="absolute right-4 top-4 font-mono text-2xl text-muted transition-colors hover:text-accent"
            >
              ×
            </button>

            <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Court conduct
            </p>
            <h2 id="justice-jojo-title" className="pr-8 font-display text-3xl font-bold">
              How Justice Jojo behaves
            </h2>

            <div className="mt-6 space-y-4 font-mono text-sm leading-relaxed text-muted">
              <p>
                <strong className="text-foreground">Real civic complaint?</strong> Jojo hears the
                case, delivers a satirical ruling, and keeps the response focused on the issue.
              </p>
              <p>
                <strong className="text-foreground">Light controversy?</strong> The courtroom turns
                into a two-way conversation until you reset the case.
              </p>
              <p>
                <strong className="text-foreground">Political gossip or wasted time?</strong> Expect
                the stamp: DON&apos;T WASTE OUR TIME.
              </p>
              <p>
                <strong className="text-foreground">Derogatory remarks about a faith?</strong> Jojo
                will not engage.
              </p>
            </div>

            <p className="mt-6 border-t border-line pt-4 font-mono text-[11px] leading-relaxed text-muted">
              Justice Jojo is an AI satire, not legal advice. AI responses may be inaccurate.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
