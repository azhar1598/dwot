type TickingLogoProps = {
  className?: string;
  title?: string;
};

export default function TickingLogo({
  className = "h-10 w-10",
  title = "Don't Waste Our Time",
}: TickingLogoProps) {
  return (
    <svg
      viewBox="0 0 200 220"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {/* shoulders / body */}
      <path
        d="M18 220 L38 148 Q100 126 162 148 L182 220 Z"
        fill="currentColor"
      />
      <line
        x1="100"
        y1="158"
        x2="100"
        y2="220"
        stroke="var(--color-background)"
        strokeWidth="4"
      />
      {/* ear tabs */}
      <rect x="6" y="60" width="16" height="28" fill="currentColor" />
      <rect x="178" y="60" width="16" height="28" fill="currentColor" />
      {/* head ring */}
      <circle
        cx="100"
        cy="96"
        r="74"
        fill="none"
        stroke="currentColor"
        strokeWidth="13"
      />
      {/* face */}
      <circle cx="100" cy="96" r="67" fill="var(--color-background)" />
      {/* tick marks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const r1 = 58;
        const r2 = i % 3 === 0 ? 50 : 54;
        const x1 = 100 + r1 * Math.sin(angle);
        const y1 = 96 - r1 * Math.cos(angle);
        const x2 = 100 + r2 * Math.sin(angle);
        const y2 = 96 - r2 * Math.cos(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="2.5"
            opacity="0.5"
          />
        );
      })}
      {/* hour hand */}
      <g className="clock-hour-hand">
        <line
          x1="100"
          y1="96"
          x2="128"
          y2="118"
          stroke="var(--color-accent)"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </g>
      {/* minute hand */}
      <g className="clock-minute-hand">
        <line
          x1="100"
          y1="96"
          x2="100"
          y2="42"
          stroke="var(--color-accent)"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>
      <circle cx="100" cy="96" r="7" fill="var(--color-accent)" />
    </svg>
  );
}
