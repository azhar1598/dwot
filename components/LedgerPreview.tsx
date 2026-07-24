import SectionLabel from "./SectionLabel";

type Entry = {
  id: string;
  platform: "YouTube" | "Instagram" | "X";
  tags: string[];
  caption: string;
  location: string;
  timestamp: string;
  status: "VERIFIED" | "UNDER REVIEW";
};

const entries: Entry[] = [
  {
    id: "DWOT-00412",
    platform: "Instagram",
    tags: ["#StalledPaperwork", "#CivicNeglect"],
    caption:
      "File pending 'signature' for 11 months at a municipal ward office. Stamp visible, officer absent — three visits, same excuse.",
    location: "Ward Office, Pune",
    timestamp: "2026-07-21 14:02 IST",
    status: "VERIFIED",
  },
  {
    id: "DWOT-00409",
    platform: "YouTube",
    tags: ["#CivicNeglect", "#QueueWatch"],
    caption:
      "214-minute wait for a duplicate ration card. Counter closes for lunch twice, reopens 40 minutes late both times.",
    location: "Taluka Office, Nashik",
    timestamp: "2026-07-20 11:47 IST",
    status: "VERIFIED",
  },
  {
    id: "DWOT-00405",
    platform: "X",
    tags: ["#Infrastructure", "#PotholeProof"],
    caption:
      "Same pothole, third monsoon in a row. Complaint number from 2024 still 'under review' per the civic app.",
    location: "Ring Road, Nagpur",
    timestamp: "2026-07-18 09:15 IST",
    status: "UNDER REVIEW",
  },
];

const platformGlyph: Record<Entry["platform"], string> = {
  YouTube: "▶",
  Instagram: "◎",
  X: "𝕏",
};

export default function LedgerPreview() {
  return (
    <section id="ledger" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <SectionLabel index="§2">Live ledger preview</SectionLabel>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            This is what the record will look like.
          </h2>
          <p className="max-w-sm font-mono text-xs leading-relaxed text-muted">
            Sample entries below — for layout only. The ledger goes live once
            moderation review is running.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-3">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="flex flex-col bg-background"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted">
                <span>{entry.id}</span>
                <span
                  className={
                    entry.status === "VERIFIED"
                      ? "text-accent"
                      : "text-muted"
                  }
                >
                  {entry.status}
                </span>
              </div>

              {/* embed placeholder — swap for an <iframe> once live */}
              <div className="relative flex aspect-video w-full items-center justify-center border-b border-line bg-background-raised">
                <span className="font-mono text-3xl text-muted">
                  {platformGlyph[entry.platform]}
                </span>
                <span className="absolute bottom-2 left-3 font-mono text-[10px] uppercase tracking-widest text-muted">
                  {entry.platform} embed
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-5">
                <p className="font-mono text-sm leading-relaxed text-foreground">
                  {entry.caption}
                </p>

                <div className="mt-auto flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-accent-dim px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-accent"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-line pt-3 font-mono text-[11px] text-muted">
                    <span>{entry.location}</span>
                    <span>{entry.timestamp}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
