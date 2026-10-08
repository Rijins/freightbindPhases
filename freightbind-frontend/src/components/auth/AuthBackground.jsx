/**
 * Atmospheric background for the auth form column. Soft gradient base, a fine
 * dot grid and a few very slowly drifting glow blobs. Works in both themes;
 * blobs are transform/opacity only and reduced-motion safe (.auth-blob is
 * gated behind prefers-reduced-motion in index.css).
 */
const AuthBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-sky-100/70 dark:from-zinc-950 dark:via-zinc-950 dark:to-navy-900/50" />
    <div className="absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:22px_22px] dark:bg-[radial-gradient(rgba(148,163,184,0.05)_1px,transparent_1px)]" />
    <div className="auth-blob absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-harbor-300/25 blur-3xl dark:bg-harbor-500/10" />
    <div
      className="auth-blob absolute -right-20 -top-24 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-600/10"
      style={{ animationDelay: "-6s" }}
    />
    <div
      className="auth-blob absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/10"
      style={{ animationDelay: "-12s" }}
    />
  </div>
);

export default AuthBackground;
