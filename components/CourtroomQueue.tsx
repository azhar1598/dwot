"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import JudgeFigure, { type HandColor } from "./courtroom/JudgeFigure";
import Bench from "./courtroom/Bench";
import VisitorAvatar, { type VisitorPhase } from "./courtroom/VisitorAvatar";
import Gavel from "./courtroom/Gavel";
import StampOverlay from "./courtroom/StampOverlay";
import FileIcon from "./courtroom/FileIcon";
import CrisisPanel from "./CrisisPanel";
import type { JudgeClassification } from "@/types/judge";

type Stage = "idle" | "enter" | "react" | "exit" | "spam";

type CourtroomQueueProps = {
  /** The classification for the current case, or null before anything is submitted. */
  result: JudgeClassification | null;
  /** Bump this on every submission so repeat categories still re-trigger the sequence. */
  requestId: number;
  /** Called from the crisis panel's "Back" button. */
  onReset: () => void;
  /** The last submission failed (network/API error) — show the judge dozing off instead of a ruling. */
  errored?: boolean;
  /**
   * True while the user is hovering/focused on the complaint input with
   * nothing actively animating. Brings the visitor in early (standing,
   * waiting) instead of only appearing once a verdict comes back.
   */
  anticipate?: boolean;
  /** True while the request to /api/judge is in flight — shows a "filing" holding pattern. */
  submitting?: boolean;
};

const STAGE_TO_VISITOR_PHASE: Record<Stage, VisitorPhase> = {
  idle: "hidden",
  enter: "enter",
  react: "react",
  exit: "exit",
  spam: "hidden",
};

const ENTER_MS = 750;
const REACT_MS: Record<"minor" | "serious", number> = { minor: 650, serious: 950 };
const EXIT_MS = 700;

export default function CourtroomQueue({
  result,
  requestId,
  onReset,
  errored = false,
  anticipate = false,
  submitting = false,
}: CourtroomQueueProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [handColor, setHandColor] = useState<HandColor>("gray");
  const [judgeReactKey, setJudgeReactKey] = useState(0);
  // Whether the verdict/stamp has been revealed for the *current* result.
  // Unlike `stage`, this deliberately does not reset once the walk-out
  // finishes — the ruling should stay visible until the next submission,
  // not flash for a second and vanish.
  const [revealed, setRevealed] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);

    // Every transition below runs inside a timer callback (even the
    // immediate one, via a 0ms timeout) rather than synchronously in the
    // effect body, so this stays a "respond to a timer" pattern rather than
    // an effect that just mirrors props into state.
    if (!result) {
      const t0 = setTimeout(() => {
        setStage("idle");
        setHandColor("gray");
        setRevealed(false);
      }, 0);
      timers.current = [t0];
      return () => clearTimeout(t0);
    }

    if (result.category === "spam") {
      const t0 = setTimeout(() => {
        setStage("spam");
        setHandColor("gray");
        setRevealed(true);
      }, 0);
      timers.current = [t0];
      return () => clearTimeout(t0);
    }

    if (result.category === "crisis") {
      // Handled by the early-return render branch below; nothing to animate.
      return;
    }

    // This single-shot animated flow only knows two visual treatments. Any
    // category outside "serious" (crisis/spam are already handled above) —
    // including "banter", which gets full two-way chat treatment on the
    // trial page instead — falls back to the "minor" visual here.
    const category: "minor" | "serious" = result.category === "serious" ? "serious" : "minor";

    const t0 = setTimeout(() => {
      setStage("enter");
      setRevealed(false);
    }, 0);

    const t1 = setTimeout(() => {
      setHandColor(category === "serious" ? "red" : "green");
      setJudgeReactKey((k) => k + 1);
      setStage("react");
      setRevealed(true);
    }, ENTER_MS);

    const t2 = setTimeout(() => {
      setStage("exit");
    }, ENTER_MS + REACT_MS[category]);

    const t3 = setTimeout(() => {
      setStage("idle");
    }, ENTER_MS + REACT_MS[category] + EXIT_MS);

    timers.current = [t0, t1, t2, t3];

    return () => {
      timers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  if (result?.category === "crisis") {
    return <CrisisPanel onReset={onReset} />;
  }

  // While the /api/judge request is actually in flight, `stage` is still
  // "idle" (the enter/react/exit sequence only starts once a result lands).
  // Use that window to show a "filing" holding pattern instead of dead air.
  const filing = submitting && stage === "idle";
  // Idle + anticipate (hovering/focused on the input, nothing animating yet)
  // walks the visitor in early as a preview — but only before any verdict has
  // been revealed yet. Once a case has been ruled on, the visitor has made
  // their exit for good; merely resting focus/hover on the input (e.g. after
  // pressing Enter, which never blurs it) must not pull them back on stage.
  // A genuinely new submission still takes over normally, since `stage`
  // moves off "idle" at that point regardless of `revealed`.
  const waitingEarly = stage === "idle" && anticipate && !revealed;
  const previewPhase = filing || waitingEarly;
  const visitorPhase: VisitorPhase = previewPhase ? "enter" : STAGE_TO_VISITOR_PHASE[stage];
  const visitorCategory = result?.category === "serious" ? "serious" : "minor";
  const showVisitor = !errored && (stage === "enter" || stage === "react" || stage === "exit" || previewPhase);
  // Hovering/focusing the input while a previous ruling is still on display
  // is read as "about to file a new case" — clear the old stamp so it
  // doesn't linger over what you're about to type next. Stepping away again
  // without submitting restores it, since nothing has actually changed. An
  // actual submission in flight always wins over a stale stamp.
  const showStamp = !errored && !filing && result?.category === "serious" && revealed && !anticipate;
  const showGavel = !errored && result?.category === "serious" && stage === "react";

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden border border-line bg-background">
        <StampOverlay visible={showStamp} />

        <div className="flex flex-col items-center pt-10">
          <JudgeFigure
            handColor={handColor}
            reactKey={judgeReactKey}
            asleep={errored}
            className="h-36 w-36 sm:h-44 sm:w-44"
          />
          <Bench className="-mt-4 w-full" />
        </div>

        <div className="absolute left-1/2 top-16 h-16 w-16 -translate-x-1/2 sm:top-20">
          <Gavel active={showGavel} className="h-full w-full" />
        </div>

        <div className="relative flex h-28 items-end justify-center pb-6">
          {showVisitor && (
            <VisitorAvatar
              phase={visitorPhase}
              category={visitorCategory}
              colorIndex={requestId}
              className="h-24 w-16"
            />
          )}
          {filing && (
            <div className="absolute -top-1 left-1/2 -translate-x-1/2">
              <FileIcon className="h-8 w-8" />
            </div>
          )}
        </div>
      </div>

      <VerdictText result={result} revealed={revealed} errored={errored} filing={filing} />
    </div>
  );
}

function VerdictText({
  result,
  revealed,
  errored,
  filing,
}: {
  result: JudgeClassification | null;
  revealed: boolean;
  errored: boolean;
  filing: boolean;
}) {
  if (filing) {
    return (
      <motion.p
        className="text-center font-mono text-xs uppercase tracking-widest text-muted"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
      >
        Filing your case with the court…
      </motion.p>
    );
  }

  if (errored) {
    return (
      <p className="text-center font-mono text-xs uppercase tracking-widest text-muted">
        The judge has dozed off. Try again in a moment.
      </p>
    );
  }

  if (!result) {
    return (
      <p className="text-center font-mono text-xs uppercase tracking-widest text-muted">
        No case has been called yet.
      </p>
    );
  }

  if (result.category === "spam") {
    return (
      <p className="text-center font-mono text-sm text-muted">
        That doesn&apos;t look like a real case.
      </p>
    );
  }

  if (!revealed) return null;

  if (result.category === "minor" || result.category === "banter") {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-display text-xl font-bold text-approve sm:text-2xl">
          {result.verdict_line}
        </p>
        {result.sub_text && (
          <p className="max-w-md font-mono text-xs text-muted">{result.sub_text}</p>
        )}
      </div>
    );
  }

  // serious — the big line is the stamp itself; this is just the supporting caption.
  return result.sub_text ? (
    <p className="mx-auto max-w-md text-center font-mono text-xs text-muted">
      {result.sub_text}
    </p>
  ) : null;
}
