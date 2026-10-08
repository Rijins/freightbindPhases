import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { fadeInUp } from "../../../animations";

const PRIMARY_CTA =
  "inline-flex items-center justify-center gap-2 rounded-[14px] bg-harbor-500 px-7 py-3.5 text-base font-medium text-navy-950 " +
  "shadow-sm transition-all duration-150 hover:bg-harbor-400 hover:shadow " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-400 " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 active:scale-[0.98]";

const SECONDARY_CTA =
  "inline-flex items-center justify-center gap-2 rounded-[14px] border border-white/20 bg-white/5 px-7 py-3.5 " +
  "text-base font-medium text-white transition-all duration-150 hover:bg-white/10 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.98]";

/**
 * CTASection — final conversion panel on a navy surface with a single subtle
 * glow. Both actions route to the existing /login page (registration is out
 * of scope for this part).
 */
const CTASection = () => (
  <section aria-labelledby="cta-heading" className="bg-slate-50 py-20 dark:bg-zinc-950 md:py-28">
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="relative overflow-hidden rounded-[24px] bg-navy-900 px-6 py-16 text-center shadow-panelHover md:px-16 md:py-20 dark:bg-zinc-900"
      >
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-harbor-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative">
          <h2
            id="cta-heading"
            className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          >
            Bring your logistics operations into one intelligent platform.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-400">
            Connect your shipments, carriers, hubs and teams — and let AI keep the whole operation
            one step ahead.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/login" className={PRIMARY_CTA}>
              Get Started
              <FiArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/login" className={SECONDARY_CTA}>
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
