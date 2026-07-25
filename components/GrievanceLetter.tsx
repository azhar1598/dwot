"use client";

import { useState } from "react";
import type { LetterDraft } from "@/types/representative";

// The parent remounts this component (via a `key` tied to the current
// submission) whenever a new letter is drafted, so local edits reset
// naturally on mount instead of needing an effect to sync from props.
export default function GrievanceLetter({
  draft,
  recipientName,
  recipientEmail,
  isMock,
}: {
  draft: LetterDraft;
  recipientName: string;
  recipientEmail: string;
  isMock: boolean;
}) {
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  const [email, setEmail] = useState(recipientEmail);
  const [copied, setCopied] = useState(false);

  const mailtoHref = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;

  async function handleCopy() {
    const text = `To: ${email}\nSubject: ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail (permissions, insecure context) — the text
      // is still visible and selectable in the textarea, so this is a
      // soft failure, not a blocker.
    }
  }

  return (
    <div className="flex flex-col gap-4 border border-line bg-background-raised p-5">
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted">
        <span>Grievance letter</span>
        <span className="text-accent">draft — review before sending</span>
      </div>

      {isMock && (
        <p className="border border-calm/60 bg-calm/10 px-3 py-2 font-mono text-xs text-calm">
          Demo mode — no GEMINI_API_KEY configured. This is a template, not an AI-drafted letter.
        </p>
      )}

      <p className="font-mono text-xs text-muted">
        This letter and the recipient email were drafted by AI. Read it carefully, fix anything
        wrong, and confirm the email address before sending — nothing is sent automatically.
      </p>

      <div className="flex flex-col gap-1">
        <label htmlFor="letter-to" className="font-mono text-[10px] uppercase tracking-widest text-muted">
          To
        </label>
        <input
          id="letter-to"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="representative@example.gov.in"
          className="border border-line bg-transparent px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
        {recipientName && (
          <span className="font-mono text-[11px] text-muted">Addressed to {recipientName}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="letter-subject" className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Subject
        </label>
        <input
          id="letter-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border border-line bg-transparent px-3 py-2 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="letter-body" className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Body
        </label>
        <textarea
          id="letter-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={9}
          className="w-full resize-y border border-line bg-transparent px-3 py-2 font-mono text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={mailtoHref}
          className={`border border-foreground bg-foreground px-6 py-2.5 text-center font-mono text-sm font-bold uppercase tracking-wider text-background transition-colors hover:border-accent hover:bg-accent ${
            !email.trim() ? "pointer-events-none opacity-50" : ""
          }`}
        >
          Send via email
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="border border-line px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          {copied ? "Copied" : "Copy text"}
        </button>
        {!email.trim() && (
          <span className="font-mono text-[11px] text-muted">
            Add a recipient email above to enable sending.
          </span>
        )}
      </div>
    </div>
  );
}
