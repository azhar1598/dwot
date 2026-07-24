import Link from "next/link";
import TickingLogo from "./TickingLogo";
import EmailCapture from "./EmailCapture";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line grain-fade">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-24 sm:py-32">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span>A public ledger, since 2026</span>
        </div>

        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="max-w-4xl font-display text-5xl font-black leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
            &ldquo;Don&apos;t waste
            <br />
            <span className="text-accent">our</span>{" "}
            time.&rdquo;
          </h1>
          <TickingLogo className="hidden h-28 w-28 shrink-0 text-foreground sm:block" />
        </div>

        <p className="max-w-2xl font-mono text-sm leading-relaxed text-muted sm:text-base">
          The Chief Justice of India said it in open court. We&apos;re saying
          it about every stalled file, every unfixed road, and every
          government window that never opens on time. This is a public,
          timestamped record of institutional delay — built from evidence
          already sitting on your phone.
        </p>

        <div className="flex flex-col gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-foreground">
            Get on the ledger early
          </span>
          <EmailCapture />
          <span className="font-mono text-xs text-muted">
            No spam. One email when submissions open. That&apos;s it.
          </span>
          <Link
            href="/courtroom"
            className="mt-2 inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent hover:text-foreground"
          >
            Or skip the wait — try the courtroom now →
          </Link>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-line sm:grid-cols-4">
          {[
            ["01", "Public"],
            ["02", "Verified"],
            ["03", "Timestamped"],
            ["04", "Permanent"],
          ].map(([num, label]) => (
            <div key={num} className="px-6 py-5 font-mono text-xs text-muted">
              <span className="text-accent">{num}</span>{" "}
              <span className="uppercase tracking-widest">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
