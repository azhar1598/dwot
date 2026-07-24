import SectionLabel from "./SectionLabel";
import EmailCapture from "./EmailCapture";
import TickingLogo from "./TickingLogo";

export default function ReferralBlock() {
  return (
    <section id="waitlist" className="relative overflow-hidden border-b border-line grain-fade">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <SectionLabel index="§5">Waitlist</SectionLabel>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-col gap-6">
            <h2 className="max-w-xl font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              The clock is ticking. The courtroom is already open.
            </h2>
            <p className="max-w-xl font-mono text-sm leading-relaxed text-muted">
              Join the list to hear about new states, new features, and
              improvements to how letters get drafted. Refer three friends
              and we&apos;ll prioritize your feedback when new constituencies
              go live.
            </p>

            <EmailCapture buttonLabel="Get updates" />

            <div className="mt-2 flex items-center gap-4 border border-line px-5 py-4 font-mono text-xs text-muted">
              <span className="text-2xl text-accent">3×</span>
              <span>
                Refer 3 friends who join the list →{" "}
                <span className="text-foreground">
                  jump the queue for feature requests
                </span>
                . Referral links go out with your confirmation email.
              </span>
            </div>
          </div>

          <TickingLogo className="hidden h-32 w-32 shrink-0 text-foreground opacity-80 lg:block" />
        </div>
      </div>
    </section>
  );
}
