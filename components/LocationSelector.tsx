"use client";

import { useEffect, useState } from "react";
import { INDIA_STATES } from "@/lib/indiaStates";
import type {
  Representative,
  RepresentativeApiResponse,
  RepresentativeLocation,
} from "@/types/representative";

export type ChosenRepresentative = {
  name: string;
  position: "MP" | "MLA";
  email: string;
};

export type LocationSelection = {
  location: RepresentativeLocation | null;
  representative: ChosenRepresentative | null;
};

type LookupStatus = "idle" | "loading" | "done" | "error";

const MANUAL_INDEX = -1;

const confidenceCopy: Record<Representative["confidence"], string> = {
  high: "AI is fairly confident — still verify before sending",
  medium: "AI isn't fully sure — please verify",
  low: "AI has low confidence — verify or fill in manually",
};

export default function LocationSelector({
  onChange,
}: {
  onChange: (selection: LocationSelection) => void;
}) {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [constituency, setConstituency] = useState("");

  const [status, setStatus] = useState<LookupStatus>("idle");
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [manualName, setManualName] = useState("");
  const [manualPosition, setManualPosition] = useState<"MP" | "MLA">("MLA");
  const [manualEmail, setManualEmail] = useState("");
  const [editableEmail, setEditableEmail] = useState("");

  async function handleLookup() {
    if (!state || status === "loading") return;
    setStatus("loading");
    setError(null);
    setRepresentatives([]);
    setNote(null);
    setSelectedIndex(null);

    try {
      const res = await fetch("/api/representative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, district, constituency }),
      });
      const data: RepresentativeApiResponse = await res.json();

      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "Couldn't look that up. Try manual entry below.");
        setStatus("error");
        return;
      }

      setRepresentatives(data.representatives);
      setNote(data.note);
      setIsMock(data.source === "mock");
      setStatus("done");
      if (data.representatives.length === 0) {
        setSelectedIndex(MANUAL_INDEX);
      }
    } catch {
      setError("Couldn't reach the lookup service. Try manual entry below.");
      setStatus("error");
    }
  }

  useEffect(() => {
    const loc: RepresentativeLocation | null = state ? { state, district, constituency } : null;

    if (selectedIndex === null) {
      onChange({ location: loc, representative: null });
      return;
    }

    if (selectedIndex === MANUAL_INDEX) {
      const representative =
        manualName.trim() && manualEmail.trim()
          ? { name: manualName.trim(), position: manualPosition, email: manualEmail.trim() }
          : null;
      onChange({ location: loc, representative });
      return;
    }

    const picked = representatives[selectedIndex];
    if (!picked) {
      onChange({ location: loc, representative: null });
      return;
    }

    const representative = editableEmail.trim()
      ? { name: picked.name, position: picked.position, email: editableEmail.trim() }
      : null;
    onChange({ location: loc, representative });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, manualName, manualPosition, manualEmail, editableEmail, state, district, constituency]);

  function selectRepresentative(index: number, rep: Representative) {
    setSelectedIndex(index);
    setEditableEmail(rep.email ?? "");
  }

  return (
    <div className="flex flex-col gap-4 border border-line bg-background-raised p-5">
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted">
        <span>Your constituency</span>
        <span className="text-accent">so we know who to send the letter to</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          aria-label="State"
          className="border border-line bg-transparent px-3 py-2 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="" className="bg-background-raised">
            State
          </option>
          {INDIA_STATES.map((s) => (
            <option key={s} value={s} className="bg-background-raised">
              {s}
            </option>
          ))}
        </select>
        <input
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          placeholder="District"
          aria-label="District"
          className="border border-line bg-transparent px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <input
          value={constituency}
          onChange={(e) => setConstituency(e.target.value)}
          placeholder="Constituency"
          aria-label="Constituency"
          className="border border-line bg-transparent px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={handleLookup}
        disabled={!state || status === "loading"}
        className="self-start border border-line px-4 py-2 font-mono text-xs uppercase tracking-widest text-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
      >
        {status === "loading" ? "Looking up…" : "Find my representative"}
      </button>

      {error && <p className="font-mono text-xs text-accent">{error}</p>}

      {isMock && status === "done" && (
        <p className="border border-calm/60 bg-calm/10 px-3 py-2 font-mono text-xs text-calm">
          Demo mode — no GEMINI_API_KEY configured. Enter representative details manually below.
        </p>
      )}

      {note && status === "done" && (
        <p className="font-mono text-xs text-muted">{note}</p>
      )}

      {representatives.length > 0 && (
        <div className="flex flex-col gap-2">
          {representatives.map((rep, i) => (
            <label
              key={`${rep.name}-${i}`}
              className={`flex cursor-pointer flex-col gap-2 border p-3 transition-colors ${
                selectedIndex === i ? "border-accent" : "border-line"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="representative"
                  checked={selectedIndex === i}
                  onChange={() => selectRepresentative(i, rep)}
                  className="accent-accent"
                />
                <span className="font-mono text-sm text-foreground">
                  {rep.name} <span className="text-muted">— {rep.position}</span>
                  {rep.party ? <span className="text-muted"> · {rep.party}</span> : null}
                </span>
              </div>
              <span className="pl-6 font-mono text-[11px] text-muted">
                {confidenceCopy[rep.confidence]}
              </span>
              {selectedIndex === i && (
                <input
                  value={editableEmail}
                  onChange={(e) => setEditableEmail(e.target.value)}
                  placeholder="Office email (verify before sending)"
                  aria-label="Representative email"
                  className="ml-6 border border-line bg-transparent px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                />
              )}
            </label>
          ))}
        </div>
      )}

      {(status === "done" || status === "error") && (
        <label
          className={`flex cursor-pointer flex-col gap-2 border p-3 transition-colors ${
            selectedIndex === MANUAL_INDEX ? "border-accent" : "border-line"
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="representative"
              checked={selectedIndex === MANUAL_INDEX}
              onChange={() => setSelectedIndex(MANUAL_INDEX)}
              className="accent-accent"
            />
            <span className="font-mono text-sm text-foreground">Enter details manually</span>
          </div>
          {selectedIndex === MANUAL_INDEX && (
            <div className="ml-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Representative name"
                aria-label="Representative name"
                className="border border-line bg-transparent px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />
              <select
                value={manualPosition}
                onChange={(e) => setManualPosition(e.target.value as "MP" | "MLA")}
                aria-label="Representative position"
                className="border border-line bg-transparent px-3 py-2 font-mono text-xs text-foreground focus:border-accent focus:outline-none"
              >
                <option value="MLA" className="bg-background-raised">MLA</option>
                <option value="MP" className="bg-background-raised">MP</option>
              </select>
              <input
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                placeholder="Office email"
                aria-label="Representative email"
                className="border border-line bg-transparent px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>
          )}
        </label>
      )}
    </div>
  );
}
