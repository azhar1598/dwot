"use client";

import { motion } from "framer-motion";

export type HandColor = "gray" | "red" | "green";

const HAND_COLORS: Record<HandColor, string> = {
  gray: "#8a8680",
  red: "#c0392b",
  green: "#639922",
};

type JudgeFigureProps = {
  handColor?: HandColor;
  /** Bump this to re-trigger the reaction animation, even for the same color. */
  reactKey?: number;
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
  className = "h-44 w-44",
}: JudgeFigureProps) {
  const color = HAND_COLORS[handColor];
  const isReacting = handColor !== "gray";

  const wobble = isReacting
    ? { rotate: [0, -10, 8, -5, 0], scale: [1, 1.15, 0.95, 1.05, 1] }
    : { rotate: 0, scale: 1 };

  return (
    <svg
      viewBox="0 0 240 280"
      className={className}
      role="img"
      aria-label="Justice Clockwork"
    >
      <title>Justice Clockwork</title>

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
        <line
          x1={CX}
          y1={CY}
          x2={CX + 24}
          y2={CY + 20}
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
        <line
          x1={CX}
          y1={CY}
          x2={CX}
          y2={CY - 48}
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
    </svg>
  );
}
