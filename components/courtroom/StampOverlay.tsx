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
          // z-20: this must always paint above the judge/bench and visitor
          // (both plain, non-positioned siblings — see CourtroomQueue.tsx).
          // Those two are static in normal flow, but Framer Motion can put
          // transforms on descendants deep inside them that were observed to
          // otherwise win the paint order over an unindexed `absolute`
          // overlay, so this is pinned explicitly rather than left to auto.
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: -8, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 14 }}
            className="border-4 border-accent px-6 py-3 text-center font-display text-2xl font-black uppercase tracking-wider text-accent sm:px-10 sm:py-4 sm:text-4xl"
          >
            Don&apos;t waste our time
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
