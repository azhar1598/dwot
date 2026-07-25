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
        <a
          href="https://www.instagram.com/_dontwasteourtime/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow Don't Waste Our Time on Instagram"
          className="text-foreground transition-colors hover:text-accent"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
          </svg>
        </a>
      </div>
    </header>
  );
}
