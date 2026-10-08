import { FiMoon, FiSun } from "react-icons/fi";
import Card, { CardHeader, CardBody } from "../../../components/Card/Card";
import { useTheme } from "../../../contexts/ThemeContext";
import { cn } from "../../../utils/cn";

const OPTIONS = [
  {
    id: "light",
    label: "Light",
    description: "Bright surfaces for daytime work.",
    icon: FiSun,
    preview: "from-slate-100 to-white",
  },
  {
    id: "dark",
    label: "Dark",
    description: "Low-glare surfaces for low-light environments.",
    icon: FiMoon,
    preview: "from-zinc-900 to-zinc-800",
  },
];

/**
 * Appearance section — reuses the existing FreightBind theme system
 * (ThemeContext + the shared `dark` class strategy). No new theme mechanism:
 * this simply lets the user pick the mode the app already supports.
 */
const AppearanceTab = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Card>
      <CardHeader
        title="Appearance"
        subtitle="Choose how FreightBind looks. The choice applies across the whole app."
      />
      <CardBody>
        <div className="grid gap-4 sm:grid-cols-2">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  if (!isActive) toggleTheme();
                }}
                aria-pressed={isActive}
                className={cn(
                  "group rounded-2xl border p-4 text-left transition-all",
                  isActive
                    ? "border-indigo-300 bg-indigo-50/60 shadow-sm dark:border-indigo-500/50 dark:bg-indigo-500/10"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm dark:border-zinc-800 dark:hover:border-zinc-700"
                )}
              >
                <div
                  className={cn(
                    "mb-3 flex h-16 items-end justify-end rounded-xl border border-slate-200/60 bg-gradient-to-br p-2 dark:border-zinc-700/60",
                    option.preview
                  )}
                  aria-hidden="true"
                >
                  <span
                    className={cn(
                      "h-4 w-10 rounded-full border border-slate-300/70 dark:border-zinc-600/70",
                      isActive ? "bg-indigo-500" : "bg-slate-300 dark:bg-zinc-600"
                    )}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    size={15}
                    className={
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-500 dark:text-zinc-400"
                    }
                  />
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isActive
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-slate-900 dark:text-white"
                    )}
                  >
                    {option.label}
                  </p>
                  {isActive && (
                    <span className="ml-auto rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Active
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};

export default AppearanceTab;
