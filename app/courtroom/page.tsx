import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourtroomExperience from "@/components/CourtroomExperience";

export const metadata: Metadata = {
  title: "The Courtroom — Don't Waste Our Time",
  description:
    "Type your bureaucratic complaint. Justice Clockwork will hear your case — and help you send a real letter to your MP or MLA.",
};

export default function CourtroomPage() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-16 sm:py-24">
        <div className="flex flex-col gap-4">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            Courtroom of Justice Clockwork
          </span>
          <h1 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            State your case. The court is listening.
          </h1>
          <p className="max-w-xl font-mono text-sm leading-relaxed text-muted">
            Tell us your constituency, then type your complaint. Justice
            Clockwork will hear it and rule accordingly — and if it&apos;s a
            real issue, we&apos;ll draft a formal letter you can send straight
            to your MP or MLA. Nothing you type is stored beyond this session.
          </p>
        </div>

        <CourtroomExperience />
      </main>
      <Footer />
    </div>
  );
}
