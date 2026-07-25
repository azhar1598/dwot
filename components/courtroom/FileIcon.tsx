"use client";

import { motion } from "framer-motion";

type FileIconProps = {
  className?: string;
};

/**
 * A small paper file/folder the visitor holds up while their case is being
 * filed — bobs and tilts gently to read as "presenting paperwork" rather
 * than a static icon, so the API round-trip doesn't feel like dead air.
 */
export default function FileIcon({ className = "h-8 w-8" }: FileIconProps) {
  return (
    <motion.svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="Filing paperwork"
      initial={{ scale: 0, opacity: 0, y: 0, rotate: -4 }}
      animate={{ scale: 1, opacity: 1, y: [0, -5, 0], rotate: [-4, 4, -4] }}
      transition={{
        scale: { duration: 0.35, ease: "backOut" },
        opacity: { duration: 0.25 },
        y: { duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.35 },
        rotate: { duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.35 },
      }}
    >
      <rect x="6" y="3" width="20" height="26" rx="1.5" fill="var(--figure)" stroke="#1a1a1a" strokeWidth="1" />
      <path d="M20 3 L26 9 L20 9 Z" fill="#cfcfcb" />
      <line x1="10" y1="14" x2="22" y2="14" stroke="#8a8a86" strokeWidth="1.5" />
      <line x1="10" y1="18" x2="22" y2="18" stroke="#8a8a86" strokeWidth="1.5" />
      <line x1="10" y1="22" x2="18" y2="22" stroke="#8a8a86" strokeWidth="1.5" />
    </motion.svg>
  );
}
