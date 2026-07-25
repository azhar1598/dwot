import Link from "next/link";
import SectionLabel from "./SectionLabel";

type SampleVerdict = {
  id: string;
  category: "MINOR" | "SERIOUS" | "CRISIS-SAFE";
  complaint: string;
  verdict: string;
  accent: "approve" | "accent" | "calm";
};

const samples: SampleVerdict[] = [
  {
    id: "01",
    category: "MINOR",
    complaint: "\"My ration card renewal has been 'processing' for four months.\"",
    verdict: "Case dismissed. The file has achieved tenure.",
    accent: "approve",
  },
  {
    id: "02",
    category: "SERIOUS",
    complaint: "\"There's an open manhole outside the school gate, unmarked, for three weeks.\"",
    verdict: "Don't waste our time. — and a letter is drafted, ready to send.",
    accent: "accent",
  },
  {
    id: "03",
    category: "CRISIS-SAFE",
    complaint: "Anything indicating real danger or self-harm...",
    verdict: "No jokes. No verdict. Just real helpline numbers, immediately.",
    accent: "calm",
  },
];

const accentClasses: Record<SampleVerdict["accent"], string> = {
  approve: "text-approve border-approve/60",
  accent: "text-accent border-accent-dim",
  calm: "text-calm border-calm/60",
};

export default function LedgerPreview() {
  return (
    <section id="courtroom-preview" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <SectionLabel index="§2">Inside the courtroom</SectionLabel>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            This is what a ruling actually looks like.
          </h2>
          <p className="max-w-sm font-mono text-xs leading-relaxed text-muted">
            Sample rulings below — for illustration. Every real submission is
            classified live, and genuine crises always take priority over
            the bit.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-3">
          {samples.map((sample) => (
            <article key={sample.id} className="flex flex-col gap-4 bg-background p-6">
              <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted">
                <span>Case {sample.id}</span>
                <span className={`border px-2 py-1 text-[10px] ${accentClasses[sample.accent]}`}>
                  {sample.category}
                </span>
              </div>
              <p className="font-mono text-sm leading-relaxed text-foreground">
                {sample.complaint}
              </p>
              <p className="mt-auto border-t border-line pt-4 font-mono text-sm leading-relaxed text-muted">
                {sample.verdict}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/courtroom"
            className="border border-foreground bg-foreground px-8 py-3 font-mono text-sm font-bold uppercase tracking-wider text-background transition-colors hover:border-accent hover:bg-accent"
          >
            Enter the courtroom
          </Link>
        </div>
      </div>
    </section>
  );
}
