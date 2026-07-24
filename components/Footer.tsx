import TickingLogo from "./TickingLogo";

export default function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="flex max-w-sm flex-col gap-4">
            <div className="flex items-center gap-3">
              <TickingLogo className="h-8 w-8 text-foreground" />
              <span className="font-condensed text-lg tracking-wide text-foreground">
                DON&apos;T WASTE OUR TIME
              </span>
            </div>
            <p className="font-mono text-xs leading-relaxed text-muted">
              The record doesn&apos;t forget. Neither will we.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 font-mono text-xs uppercase tracking-widest text-muted sm:flex sm:gap-16">
            <div className="flex flex-col gap-3">
              <span className="text-foreground">Platform</span>
              <a href="#how-it-works" className="hover:text-accent">
                How it works
              </a>
              <a href="#ledger" className="hover:text-accent">
                The ledger
              </a>
              <a href="#submit" className="hover:text-accent">
                Submit a link
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-foreground">Follow</span>
              <a
                href="https://x.com/dontwasteourtime"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                X / Twitter
              </a>
              <a
                href="https://instagram.com/dontwasteourtime"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                Instagram
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-foreground">Contact</span>
              <a
                href="mailto:hello@dontwasteourtime.in"
                className="hover:text-accent"
              >
                hello@dontwasteourtime.in
              </a>
              <a
                href="mailto:report@dontwasteourtime.in"
                className="hover:text-accent"
              >
                Report abuse
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 font-mono text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} Don&apos;t Waste Our Time. A citizen
            ledger, not a legal filing.
          </span>
          <span>We curate public links. We don&apos;t host media.</span>
        </div>
      </div>
    </footer>
  );
}
