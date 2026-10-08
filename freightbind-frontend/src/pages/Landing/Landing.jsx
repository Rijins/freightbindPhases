import { MotionConfig } from "framer-motion";
import LandingNavbar from "./components/LandingNavbar";
import Hero from "./components/Hero";
import TrustStrip from "./components/TrustStrip";
import ProblemSolution from "./components/ProblemSolution";
import CoreFeatures from "./components/CoreFeatures";
import Workflow from "./components/Workflow";
import AIIntelligence from "./components/AIIntelligence";
import RoleSection from "./components/RoleSection";
import PlatformPreview from "./components/PlatformPreview";
import CTASection from "./components/CTASection";
import LandingFooter from "./components/LandingFooter";

/**
 * Public marketing page served at `/` for unauthenticated visitors.
 * Purely presentational — no API calls, no sockets, no Redux side effects.
 * Reuses the shared design system (cards, badges, buttons, theme tokens,
 * framer variants) and honors the global MotionConfig reduced-motion rule.
 */
const Landing = () => (
  <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-slate-200">
      <LandingNavbar />
      <main>
        <Hero />
        <TrustStrip />
        <ProblemSolution />
        <CoreFeatures />
        <Workflow />
        <AIIntelligence />
        <RoleSection />
        <PlatformPreview />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  </MotionConfig>
);

export default Landing;
