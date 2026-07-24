import Link from "next/link";
import TickingLogo from "./TickingLogo";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-foreground">
          <TickingLogo className="h-9 w-9 text-foreground" />
          <span className="font-condensed text-xl leading-none tracking-wide">
            DON&apos;T WASTE
            <br />
            OUR TIME
          </span>
        </Link>
        <nav className="hidden items-center gap-8 font-mono text-xs uppercase tracking-widest text-muted sm:flex">
          <Link href="/#how-it-works" className="hover:text-foreground">
            How it works
          </Link>
          <Link href="/#courtroom-preview" className="hover:text-foreground">
            See a ruling
          </Link>
          <Link href="/#submit" className="hover:text-foreground">
            Send a letter
          </Link>
          <Link href="/courtroom" className="hover:text-foreground">
            Courtroom
          </Link>
          <Link href="/trial" className="hover:text-foreground">
            Live trial
          </Link>
        </nav>
        <Link
          href="/#waitlist"
          className="border border-foreground px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:border-accent hover:bg-accent"
        >
          Join
        </Link>
      </div>
    </header>
  );
}
