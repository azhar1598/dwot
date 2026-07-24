"use client";

import { motion } from "framer-motion";

type GavelProps = {
  active: boolean;
  className?: string;
};

export default function Gavel({ active, className = "h-16 w-16" }: GavelProps) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      initial={{ opacity: 0, x: 0, y: 0, rotate: -35, scale: 0.75 }}
      animate={
        active
          ? {
              opacity: [1, 1, 0],
              x: [0, 70, 150],
              y: [0, -50, 10],
              rotate: [-35, 15, 95],
              scale: [0.75, 1, 0.85],
              transition: { duration: 0.85, ease: "easeIn", times: [0, 0.5, 1] },
            }
          : { opacity: 0 }
      }
      role="img"
      aria-label="Gavel"
    >
      {/* handle */}
      <rect
        x="44"
        y="30"
        width="10"
        height="55"
        rx="3"
        fill="#8b5a2b"
        transform="rotate(20 49 57)"
      />
      {/* head */}
      <rect x="18" y="14" width="42" height="22" rx="4" fill="#a86a34" />
      <rect x="18" y="14" width="42" height="8" rx="4" fill="#c17f3e" />
    </motion.svg>
  );
}
