import type { Metadata } from "next";
import Header from "@/components/Header";
import TrialChat from "@/components/TrialChat";

export const metadata: Metadata = {
  title: "Live Trial — Don't Waste Our Time",
  description:
    "Justice Clockwork is in session. State your case at the bottom and watch the court rule live.",
};

export default function TrialPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <Header />
      <TrialChat />
    </div>
  );
}
