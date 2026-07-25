"use client";

import { motion } from "framer-motion";

export type HandColor = "gray" | "red" | "green";

const HAND_COLORS: Record<HandColor, string> = {
  gray: "#8a8680",
  red: "#c0392b",
  green: "#639922",
};

const SLEEP_COLOR = "#5f6b78";

type JudgeFigureProps = {
  handColor?: HandColor;
  /** Bump this to re-trigger the reaction animation, even for the same color. */
  reactKey?: number;
  /** Something went wrong (network/API error) — the judge dozes off instead of reacting. */
  asleep?: boolean;
  className?: string;
};

const CX = 120;
const CY = 108;

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

export default function JudgeFigure({
  handColor = "gray",
  reactKey = 0,
  asleep = false,
  className = "h-44 w-44",
}: JudgeFigureProps) {
  const color = asleep ? SLEEP_COLOR : HAND_COLORS[handColor];
  const isReacting = !asleep && handColor !== "gray";

  const wobble = isReacting
    ? { rotate: [0, -10, 8, -5, 0], scale: [1, 1.15, 0.95, 1.05, 1] }
    : { rotate: 0, scale: 1 };

  const hourHandEnd = asleep ? { x: CX - 16, y: CY + 24 } : { x: CX + 24, y: CY + 20 };
  const minuteHandEnd = asleep ? { x: CX + 12, y: CY + 44 } : { x: CX, y: CY - 48 };

  return (
    <svg
      viewBox="0 0 240 280"
      className={className}
      role="img"
      aria-label={asleep ? "Justice Clockwork, dozed off" : "Justice Clockwork"}
    >
      <title>{asleep ? "Justice Clockwork, dozed off" : "Justice Clockwork"}</title>

      <motion.g
        animate={
          asleep
            ? { rotate: [0, 5, 5, 0], y: [0, 3, 3, 0] }
            : { rotate: 0, y: 0 }
        }
        transition={
          asleep
            ? { duration: 2.6, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.6, 1] }
            : { duration: 0.3 }
        }
        style={{ transformBox: "view-box", transformOrigin: "120px 280px" }}
      >
        {asleep && (
          <g aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.text
                key={i}
                x={168 + i * 9}
                y={54 - i * 10}
                fontSize={13 - i * 2}
                fontFamily="var(--font-mono, monospace)"
                fill={SLEEP_COLOR}
                initial={{ opacity: 0, y: 54 - i * 10 }}
                animate={{ opacity: [0, 1, 1, 0], y: 54 - i * 10 - 22 }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeOut",
                }}
              >
                z
              </motion.text>
            ))}
          </g>
        )}

        {/* faceless robed silhouette */}
      <path
        d="M32 280 L58 172 Q120 142 182 172 L208 280 Z"
        fill="var(--color-figure)"
      />
      <line
        x1="120"
        y1="188"
        x2="120"
        y2="280"
        stroke="var(--color-background)"
        strokeWidth="4"
        opacity="0.2"
      />

      {/* hood collar around the clock face */}
      <path
        d="M44 138 Q120 104 196 138 L184 166 Q120 138 56 166 Z"
        fill="var(--color-figure)"
      />

      {/* ear tabs */}
      <rect x="30" y="86" width="14" height="26" fill="var(--color-figure)" />
      <rect x="196" y="86" width="14" height="26" fill="var(--color-figure)" />

      {/* head ring + face */}
      <circle
        cx={CX}
        cy={CY}
        r="66"
        fill="none"
        stroke="var(--color-figure)"
        strokeWidth="12"
      />
      <circle cx={CX} cy={CY} r="59" fill="var(--color-background)" />

      {/* tick marks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const r1 = 51;
        const r2 = i % 3 === 0 ? 43 : 47;
        return (
          <line
            key={i}
            x1={round(CX + r1 * Math.sin(angle))}
            y1={round(CY - r1 * Math.cos(angle))}
            x2={round(CX + r2 * Math.sin(angle))}
            y2={round(CY - r2 * Math.cos(angle))}
            stroke="var(--color-figure)"
            strokeWidth="2.5"
            opacity="0.45"
          />
        );
      })}

      {/* hour hand */}
      <motion.g
        key={`hour-${reactKey}`}
        animate={wobble}
        transition={{ duration: 0.55, ease: "easeInOut" }}
        style={{ transformBox: "view-box", transformOrigin: `${CX}px ${CY}px` }}
      >
        <motion.line
          x1={CX}
          y1={CY}
          initial={{ x2: CX + 24, y2: CY + 20 }}
          animate={{ x2: hourHandEnd.x, y2: hourHandEnd.y }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
        />
      </motion.g>

      {/* minute hand */}
      <motion.g
        key={`minute-${reactKey}`}
        animate={wobble}
        transition={{ duration: 0.55, ease: "easeInOut", delay: 0.04 }}
        style={{ transformBox: "view-box", transformOrigin: `${CX}px ${CY}px` }}
      >
        <motion.line
          x1={CX}
          y1={CY}
          initial={{ x2: CX, y2: CY - 48 }}
          animate={{ x2: minuteHandEnd.x, y2: minuteHandEnd.y }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
        />
      </motion.g>

      <motion.circle
        cx={CX}
        cy={CY}
        r="6"
        fill={color}
        animate={{ scale: isReacting ? [1, 1.4, 1] : 1 }}
        transition={{ duration: 0.5 }}
      />
      </motion.g>
    </svg>
  );
}
