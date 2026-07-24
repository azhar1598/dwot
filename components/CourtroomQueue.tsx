"use client";

import { useEffect, useRef, useState } from "react";
import JudgeFigure, { type HandColor } from "./courtroom/JudgeFigure";
import Bench from "./courtroom/Bench";
import VisitorAvatar, { type VisitorPhase } from "./courtroom/VisitorAvatar";
import Gavel from "./courtroom/Gavel";
import StampOverlay from "./courtroom/StampOverlay";
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
};

const ENTER_MS = 750;
const REACT_MS: Record<"minor" | "serious", number> = { minor: 650, serious: 950 };
const EXIT_MS = 700;

export default function CourtroomQueue({ result, requestId, onReset }: CourtroomQueueProps) {
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

    const category = result.category; // "minor" | "serious"

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

  const visitorPhase: VisitorPhase =
    stage === "enter" ? "enter" : stage === "react" ? "react" : stage === "exit" ? "exit" : "hidden";
  const visitorCategory = result?.category === "serious" ? "serious" : "minor";
  const showVisitor = stage === "enter" || stage === "react" || stage === "exit";
  const showStamp = result?.category === "serious" && revealed;
  const showGavel = result?.category === "serious" && stage === "react";

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden border border-line bg-background">
        <StampOverlay visible={showStamp} />

        <div className="flex flex-col items-center pt-10">
          <JudgeFigure handColor={handColor} reactKey={judgeReactKey} className="h-36 w-36 sm:h-44 sm:w-44" />
          <Bench className="-mt-4 w-full" />
        </div>

        <div className="absolute left-1/2 top-16 h-16 w-16 -translate-x-1/2 sm:top-20">
          <Gavel active={showGavel} className="h-full w-full" />
        </div>

        <div className="flex h-28 items-end justify-center pb-6">
          {showVisitor && (
            <VisitorAvatar
              phase={visitorPhase}
              category={visitorCategory}
              colorIndex={requestId}
              className="h-24 w-16"
            />
          )}
        </div>
      </div>

      <VerdictText result={result} revealed={revealed} />
    </div>
  );
}

function VerdictText({
  result,
  revealed,
}: {
  result: JudgeClassification | null;
  revealed: boolean;
}) {
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

  if (result.category === "minor") {
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
