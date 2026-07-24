import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import LedgerPreview from "@/components/LedgerPreview";
import SubmissionCTA from "@/components/SubmissionCTA";
import TrustNote from "@/components/TrustNote";
import ReferralBlock from "@/components/ReferralBlock";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero />
        <HowItWorks />
        <LedgerPreview />
        <SubmissionCTA />
        <TrustNote />
        <ReferralBlock />
      </main>
      <Footer />
    </div>
  );
}
