/**
 * Slim enterprise footer pinned to the bottom of the content column.
 * Copy-only chrome — no fabricated metrics, no data.
 */
const Footer = () => {
  return (
    <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 text-xs text-slate-500 dark:text-zinc-400">
        <p>© {new Date().getFullYear()} FreightBind AI. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          <span className="hidden sm:inline">Systems Operational</span>
          <span className="mx-1 hidden h-3 w-px bg-slate-200 dark:bg-zinc-700 sm:block" aria-hidden="true" />
          <span className="font-mono">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
