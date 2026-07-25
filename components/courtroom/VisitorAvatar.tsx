"use client";

import { motion, type Variants } from "framer-motion";

export type VisitorPhase = "hidden" | "enter" | "react" | "exit";
export type VisitorCategory = "minor" | "serious";

const PALETTE = ["#c0392b", "#d98e34", "#4a7f93", "#8a6fb0", "#4f9d69"];

type VisitorAvatarProps = {
  phase: VisitorPhase;
  category: VisitorCategory;
  colorIndex?: number;
  className?: string;
};

export default function VisitorAvatar({
  phase,
  category,
  colorIndex = 0,
  className = "h-24 w-16",
}: VisitorAvatarProps) {
  const color = PALETTE[colorIndex % PALETTE.length];

  const variants: Variants = {
    hidden: { x: -140, opacity: 0, rotate: 0 },
    enter: { x: 0, opacity: 1, rotate: 0, transition: { duration: 0.7, ease: "easeOut" } },
    react:
      category === "serious"
        ? {
            x: [0, 16, -16, 9, 0],
            rotate: [0, 6, -6, 3, 0],
            transition: { duration: 0.6, ease: "easeInOut" },
          }
        : {
            y: [0, -14, 0],
            transition: { duration: 0.5, ease: "easeOut" },
          },
    exit:
      category === "serious"
        ? { x: 260, opacity: 0, rotate: 14, transition: { duration: 0.6, ease: "easeIn" } }
        : { x: -260, opacity: 0, transition: { duration: 0.6, ease: "easeIn" } },
  };

  return (
    <motion.svg
      viewBox="0 0 80 120"
      className={className}
      variants={variants}
      initial="hidden"
      animate={phase}
      role="img"
      aria-label="Visitor"
    >
      <circle cx="40" cy="24" r="18" fill={color} />
      <path d="M14 118 L22 62 Q40 50 58 62 L66 118 Z" fill={color} />
    </motion.svg>
  );
}
