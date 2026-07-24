import SectionLabel from "./SectionLabel";

const steps = [
  {
    num: "01",
    title: "Submit a link",
    copy: "Found a video of a stalled office, a pothole nobody's fixed, or a queue that hasn't moved in hours? Drop the public link — Instagram, YouTube, X, wherever it lives.",
  },
  {
    num: "02",
    title: "Moderation review",
    copy: "Every submission is checked for source, context, and public interest before it goes anywhere near the ledger. No anonymous accusations, no doctored clips.",
  },
  {
    num: "03",
    title: "Published to the ledger",
    copy: "Verified evidence is timestamped, tagged, and added to the public record. It stays there — permanently, and citably.",
  },
  {
    num: "04",
    title: "Shared & amplified",
    copy: "The ledger gets pushed out until the right people see it. Patterns get flagged. Repeat offenders get named.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <SectionLabel index="§1">How it works</SectionLabel>

        <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          Four steps from your phone to the public record.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col gap-4 bg-background p-8">
              <span className="font-display text-4xl font-black text-accent">
                {step.num}
              </span>
              <h3 className="font-condensed text-2xl tracking-wide text-foreground">
                {step.title}
              </h3>
              <p className="font-mono text-sm leading-relaxed text-muted">
                {step.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
