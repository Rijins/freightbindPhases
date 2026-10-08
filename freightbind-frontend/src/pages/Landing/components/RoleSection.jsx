import { motion } from "framer-motion";
import { FiArchive, FiNavigation, FiShield, FiTruck } from "react-icons/fi";
import Badge from "../../../components/Badges/Badge";
import { ROLES } from "../../../utils/constants";
import { ROLE_THEMES } from "../../../utils/themeTokens";
import { fadeInUp, staggerContainer } from "../../../animations";

const ROLE_PRESENTATIONS = [
  {
    role: ROLES.ADMIN,
    icon: FiShield,
    description: "Platform administration and oversight.",
  },
  {
    role: ROLES.LOGISTICS_DIRECTOR,
    icon: FiNavigation,
    description: "Operational coordination and strategic visibility.",
  },
  {
    role: ROLES.CARRIER_DISPATCHER,
    icon: FiTruck,
    description: "Shipment assignment and carrier operations.",
  },
  {
    role: ROLES.HUB_OPERATOR,
    icon: FiArchive,
    description: "Hub-side shipment and location operations.",
  },
];

/**
 * RoleSection — the four operational roles. Icon accents come from the same
 * ROLE_THEMES tokens the dashboard uses, so the identities match. Marketing
 * copy only; no internal permission details are exposed.
 */
const RoleSection = () => (
  <section
    id="roles"
    aria-labelledby="roles-heading"
    className="scroll-mt-20 bg-slate-50 py-20 dark:bg-zinc-900/30 md:py-28"
  >
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-2xl text-center"
      >
        <Badge tone="custom" className="bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
          Built For Every Team
        </Badge>
        <h2
          id="roles-heading"
          className="mt-4 font-display text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl dark:text-white"
        >
          One platform, four operational roles
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-zinc-400">
          Each team gets its own view of the same coordinated operation.
        </p>
      </motion.div>

      <motion.ul
        variants={staggerContainer(0.08)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {ROLE_PRESENTATIONS.map(({ role, icon: Icon, description }) => {
          const theme = ROLE_THEMES[role];
          return (
            <motion.li
              key={role}
              variants={fadeInUp}
              className="rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-panel transition-shadow duration-150 hover:shadow-panelHover dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${theme.primary.softBg} ${theme.primary.softText}`}
              >
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-navy-900 dark:text-white">
                {role}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                {description}
              </p>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  </section>
);

export default RoleSection;
