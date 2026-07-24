import SectionLabel from "./SectionLabel";
import SubmissionForm from "./SubmissionForm";

export default function SubmissionCTA() {
  return (
    <section id="submit" className="border-b border-line bg-background-raised">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <SectionLabel index="§3">Submit evidence</SectionLabel>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-6">
            <h2 className="max-w-xl font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              Anyone can submit a link. No account. No gatekeeping.
            </h2>
            <p className="max-w-xl font-mono text-sm leading-relaxed text-muted">
              If you filmed it, or found it public, it belongs on the record.
              Four fields — the link, what&apos;s happening, where, and what
              kind of failure it is. Moderation takes it from there.
            </p>
            <ul className="flex flex-col gap-3 font-mono text-sm text-muted">
              {[
                "Takes under a minute",
                "You stay anonymous by default — no name, no phone, no account",
                "We only accept public, already-posted content",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 text-accent">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-line p-6">
            <div className="mb-6 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted">
              <span>Submission form</span>
              <span className="text-accent">4 fields · ~1 min</span>
            </div>
            <SubmissionForm />
          </div>
        </div>
      </div>
    </section>
  );
}
