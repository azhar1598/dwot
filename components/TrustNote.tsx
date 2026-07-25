import SectionLabel from "./SectionLabel";

const points = [
  {
    title: "Crisis always overrides the joke",
    copy: "Every submission is screened for genuine danger or distress before the judge persona ever sees it. If flagged, the satire is skipped entirely and you're shown real helpline numbers — not a punchline.",
  },
  {
    title: "AI can be wrong — nothing sends itself",
    copy: "Your representative's name, contact, and letter text are AI-suggested, not verified fact. Every field stays editable, and the letter only leaves via your own email client after you review it.",
  },
  {
    title: "This isn't a legal filing",
    copy: "The courtroom is satire, and the letter it drafts is a citizen grievance — not a legal complaint, verdict, or accusation. It carries no official standing on its own.",
  },
  {
    title: "Nothing is stored beyond your session",
    copy: "No accounts, no message history saved server-side. We log which category a submission fell into — never the text itself — solely to monitor how often real crises are being caught.",
  },
];

export default function TrustNote() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <SectionLabel index="§4">Trust &amp; safety</SectionLabel>

        <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          The bit stops the moment it isn&apos;t funny anymore.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
          {points.map((point) => (
            <div key={point.title} className="flex gap-4 border-l-2 border-accent-dim pl-5">
              <div>
                <h3 className="font-condensed text-xl tracking-wide text-foreground">
                  {point.title}
                </h3>
                <p className="mt-2 font-mono text-sm leading-relaxed text-muted">
                  {point.copy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
