import Link from "next/link";
import SectionLabel from "./SectionLabel";

const features = [
  {
    title: "Targeted, not generic",
    copy: "Your State, District, and Constituency decide who the letter goes to — your actual MP or MLA, not a generic inbox.",
  },
  {
    title: "Formal, on your behalf",
    copy: "The satire stays in the courtroom. The letter itself is rewritten in plain, respectful, non-vulgar civic language — ready to represent you.",
  },
  {
    title: "You send it, not us",
    copy: "Nothing goes out automatically. The letter opens in your own email client via a mailto link, fully editable before you hit send.",
  },
];

export default function SubmissionCTA() {
  return (
    <section id="submit" className="border-b border-line bg-background-raised">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <SectionLabel index="§3">From rant to letter</SectionLabel>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-6">
            <h2 className="max-w-xl font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              A real complaint deserves a real letter, not just a verdict.
            </h2>
            <p className="max-w-xl font-mono text-sm leading-relaxed text-muted">
              For anything the court rules minor or serious, a formal grievance
              letter is drafted alongside the ruling — addressed to your local
              representative, grounded in what you actually typed.
            </p>
            <ul className="flex flex-col gap-3 font-mono text-sm text-muted">
              {[
                "AI-suggested representative details — always yours to verify or override",
                "Editable subject, body, and recipient before anything is sent",
                "No accounts, no storage — the letter lives in your session only",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 text-accent">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4 border border-line p-6">
            <div className="mb-2 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted">
              <span>What you get</span>
              <span className="text-accent">per ruling</span>
            </div>
            {features.map((feature) => (
              <div key={feature.title} className="border-l-2 border-accent-dim pl-4">
                <h3 className="font-condensed text-lg tracking-wide text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-1 font-mono text-xs leading-relaxed text-muted">
                  {feature.copy}
                </p>
              </div>
            ))}
            <Link
              href="/courtroom"
              className="mt-2 border border-foreground bg-foreground px-6 py-2.5 text-center font-mono text-sm font-bold uppercase tracking-wider text-background transition-colors hover:border-accent hover:bg-accent"
            >
              Try it now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
