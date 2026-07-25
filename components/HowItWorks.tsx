import SectionLabel from "./SectionLabel";

const steps = [
  {
    num: "01",
    title: "Name your constituency",
    copy: "Pick your State, District, and Constituency. That's how we know which MP or MLA your letter should actually reach.",
  },
  {
    num: "02",
    title: "State your case",
    copy: "Type the complaint the way you'd actually say it — stalled paperwork, a pothole, a queue that never moves. No forms, no formatting required.",
  },
  {
    num: "03",
    title: "Justice Jojo rules",
    copy: "The AI judge classifies and reacts in character. Genuine emergencies are routed straight to real help — never joked about, never delayed.",
  },
  {
    num: "04",
    title: "Send the letter",
    copy: "A formal, non-vulgar grievance letter is drafted automatically. Review it, fix anything you want, then send it straight from your own email client.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <SectionLabel index="§1">How it works</SectionLabel>

        <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          Four steps from a rant to a real letter.
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
