"use client";

import { useState, type FormEvent } from "react";

// TODO: point this at your backend/Airtable endpoint.
const SUBMIT_ENDPOINT = "/api/submissions";

const CATEGORIES = [
  { value: "civic-neglect", label: "Civic neglect" },
  { value: "stalled-paperwork", label: "Stalled paperwork" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "other", label: "Other" },
] as const;

const DESCRIPTION_MAX = 300;

type FormState = {
  link: string;
  description: string;
  location: string;
  category: string;
  incidentDate: string;
  email: string;
};

const initialState: FormState = {
  link: "",
  description: "",
  location: "",
  category: "",
  incidentDate: "",
  email: "",
};

type FieldErrors = Partial<Record<keyof FormState, string>>;
type Status = "idle" | "loading" | "success" | "error";

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function SubmissionForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [reference, setReference] = useState("");

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};

    if (!form.link.trim()) {
      next.link = "Paste the link to the post or video.";
    } else if (!isValidUrl(form.link.trim())) {
      next.link = "That doesn't look like a valid link.";
    }

    if (!form.description.trim()) {
      next.description = "Give us one or two sentences of context.";
    } else if (form.description.length > DESCRIPTION_MAX) {
      next.description = `Keep it under ${DESCRIPTION_MAX} characters.`;
    }

    if (!form.location.trim()) {
      next.location = "Enter a city/area, or write 'unknown'.";
    }

    if (!form.category) {
      next.category = "Pick the closest category.";
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Enter a valid email, or leave it blank.";
    }

    return next;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setStatus("loading");

    try {
      // Wire this up to your backend/Airtable submissions table. Left as
      // a stub so the front-end can ship ahead of the moderation pipeline.
      await new Promise((resolve) => setTimeout(resolve, 600));
      console.log("evidence submission:", form, SUBMIT_ENDPOINT);
      setReference(`DWOT-PENDING-${Date.now().toString(36).toUpperCase()}`);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex h-full flex-col justify-center gap-3 border border-accent/60 bg-accent/10 px-6 py-8 text-center font-mono text-sm text-foreground">
        <span className="text-lg text-accent">✓ LOGGED.</span>
        <p className="leading-relaxed text-foreground">
          Your submission is in the moderation queue. We review within 48
          hours — no account needed to check back.
        </p>
        <p className="text-xs text-muted">Reference: {reference}</p>
        <button
          type="button"
          onClick={() => {
            setForm(initialState);
            setStatus("idle");
          }}
          className="mx-auto mt-2 border border-line px-4 py-2 text-xs uppercase tracking-widest text-muted hover:border-accent hover:text-foreground"
        >
          Submit another link
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Field
        label="Link to the post or video"
        required
        error={errors.link}
      >
        <input
          type="url"
          value={form.link}
          onChange={(e) => updateField("link", e.target.value)}
          placeholder="https://instagram.com/reel/..."
          aria-label="Link to the post or video"
          className={inputClass(Boolean(errors.link))}
        />
      </Field>

      <Field
        label="What's happening"
        required
        error={errors.description}
        hint="1–2 sentences. This becomes the card caption."
      >
        <textarea
          value={form.description}
          onChange={(e) =>
            updateField("description", e.target.value.slice(0, DESCRIPTION_MAX))
          }
          rows={3}
          placeholder="File pending 'signature' for 11 months at a ward office..."
          aria-label="Description"
          className={`${inputClass(Boolean(errors.description))} resize-none`}
        />
        <span className="mt-1 block text-right text-[10px] text-muted">
          {form.description.length}/{DESCRIPTION_MAX}
        </span>
      </Field>

      <Field label="Location" required error={errors.location}>
        <input
          type="text"
          value={form.location}
          onChange={(e) => updateField("location", e.target.value)}
          placeholder="City / area — or 'unknown'"
          aria-label="Location"
          className={inputClass(Boolean(errors.location))}
        />
      </Field>

      <Field label="Category" required error={errors.category}>
        <select
          value={form.category}
          onChange={(e) => updateField("category", e.target.value)}
          aria-label="Category"
          className={`${inputClass(Boolean(errors.category))} ${
            form.category ? "" : "text-muted"
          }`}
        >
          <option value="" disabled>
            Select a category
          </option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value} className="text-foreground">
              {cat.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Date it happened" optional hint="Leave blank if unsure.">
          <input
            type="date"
            value={form.incidentDate}
            onChange={(e) => updateField("incidentDate", e.target.value)}
            aria-label="Approximate date of incident"
            className={inputClass(false)}
          />
        </Field>

        <Field
          label="Email"
          optional
          error={errors.email}
          hint="Only if you want updates. Anonymous by default."
        >
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="you@email.com"
            aria-label="Email (optional)"
            className={inputClass(Boolean(errors.email))}
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-2 w-full border border-foreground bg-foreground px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-background transition-colors hover:border-accent hover:bg-accent disabled:opacity-60"
      >
        {status === "loading" ? "Submitting…" : "Submit to the ledger"}
      </button>

      {status === "error" && (
        <p className="text-center font-mono text-xs text-accent">
          Something went wrong. Try again in a moment.
        </p>
      )}
    </form>
  );
}

function inputClass(hasError: boolean) {
  return `w-full border bg-transparent px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none ${
    hasError ? "border-accent" : "border-line"
  }`;
}

function Field({
  label,
  required,
  optional,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-xs uppercase tracking-widest text-muted">
        {label}
        {required && <span className="text-accent"> *</span>}
        {optional && <span className="text-muted"> (optional)</span>}
      </span>
      {children}
      {error ? (
        <span className="font-mono text-xs text-accent">{error}</span>
      ) : hint ? (
        <span className="font-mono text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
