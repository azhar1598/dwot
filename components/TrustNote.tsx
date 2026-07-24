import SectionLabel from "./SectionLabel";

const points = [
  {
    title: "We don't host media",
    copy: "The ledger only links to and embeds content that's already public on Instagram, YouTube, or X. We never re-upload, re-host, or store video files ourselves.",
  },
  {
    title: "Every entry is reviewed",
    copy: "A human moderation pass checks source, context, and public-interest relevance before anything is published. Submissions that fail review are discarded, not published.",
  },
  {
    title: "This isn't a legal filing",
    copy: "The ledger is a public record of publicly available evidence — not a legal complaint, verdict, or accusation of wrongdoing by any named individual.",
  },
  {
    title: "Takedowns are respected",
    copy: "If you're featured in an entry and believe it's inaccurate, out of context, or should be removed, contact us and we'll review it promptly.",
  },
];

export default function TrustNote() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <SectionLabel index="§4">Trust &amp; accountability</SectionLabel>

        <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          We curate public evidence. We don&apos;t create it.
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
