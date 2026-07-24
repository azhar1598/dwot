"use client";

import { motion, AnimatePresence } from "framer-motion";

type StampOverlayProps = {
  visible: boolean;
};

export default function StampOverlay({ visible }: StampOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: -8, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 14 }}
            className="border-4 border-accent px-6 py-3 font-display text-2xl font-black uppercase tracking-wider text-accent sm:px-10 sm:py-4 sm:text-4xl"
          >
            Don&apos;t waste our time
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
