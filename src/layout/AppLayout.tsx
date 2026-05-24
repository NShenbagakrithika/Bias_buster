import { useMemo } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Button from "../components/ui/Button";
import ThemeToggle from "../components/ThemeToggle";

const nav = [
  { to: "/workspace", label: "Workspace" },
  { to: "/analyze", label: "Bias Audit" },
  { to: "/rewrite", label: "Rewrite Studio" },
  { to: "/rules", label: "Bias Rules" },
  { to: "/history", label: "Reports" },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const reduce = useReducedMotion();

  const ease = useMemo(() => [0.16, 1, 0.3, 1] as const, []);
  const fast = useMemo(() => ({ duration: 0.14, ease }), [ease]);
  const normal = useMemo(() => ({ duration: 0.2, ease }), [ease]);

  const current = nav.find((n) => n.to === location.pathname);
  const pageTitle = current?.label ?? "Workspace";

  const subtitleByPath: Record<string, string> = {
    "/workspace": "Quick actions, recent reports, and usage.",
    "/analyze": "Scan text for inclusion risks and practical fixes.",
    "/rewrite": "Generate inclusive rewrite variants.",
    "/rules": "Enable or disable inclusion checks.",
    "/history": "Review saved audits and rewrites.",
  };

  const pageSubtitle = subtitleByPath[location.pathname] ?? "";

  const breadcrumb = location.pathname === "/workspace" ? "Workspace" : `Workspace / ${pageTitle}`;
  return (
    <motion.div
      className="min-h-screen bg-[var(--bg)] text-[var(--text)]"
      initial={reduce ? false : { opacity: 0 }}
      animate={reduce ? undefined : { opacity: 1 }}
      transition={normal}
    >
      <motion.div
        className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-5 sm:px-6 md:grid-cols-[260px_1fr]"
        initial={reduce ? false : { y: 8, opacity: 0 }}
        animate={reduce ? undefined : { y: 0, opacity: 1 }}
        transition={normal}
      >
        {/* Sidebar */}
        <motion.aside
          className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 md:sticky md:top-6 md:h-[calc(100vh-48px)]"
          whileHover={reduce ? undefined : { y: -1 }}
          whileTap={reduce ? undefined : { scale: 0.998 }}
          transition={fast}
        >
          <motion.div
            className="mb-6"
            whileHover={reduce ? undefined : { y: -1 }}
            transition={fast}
          >
            <motion.div
              className="text-lg font-semibold tracking-tight text-[var(--text)]"
              whileHover={reduce ? undefined : { letterSpacing: "-0.01em" }}
              transition={fast}
            >
              Bias Buster
            </motion.div>
            <motion.div
              className="mt-1 text-xs text-[var(--muted)]"
              initial={false}
              animate={reduce ? undefined : { opacity: 1 }}
              transition={fast}
            >
              Explainable bias QA + inclusive rewrites
            </motion.div>
          </motion.div>

          <nav className="space-y-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    "relative block rounded-lg px-3 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]",
                    isActive
                      ? "bg-[color-mix(in_srgb,var(--primary)_10%,var(--card))] text-[var(--text)]"
                      : "text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--primary)_6%,var(--card))] hover:text-[var(--text)] hover:shadow-sm",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <motion.span
                    className="relative flex items-center gap-2"
                    whileHover={reduce ? undefined : { x: 1 }}
                    whileTap={reduce ? undefined : { scale: 0.99 }}
                    transition={fast}
                  >
                    <AnimatePresence initial={false} mode="wait">
                      {isActive ? (
                        <motion.span
                          key="active-nav-indicator"
                          layoutId="active-nav-indicator"
                          className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[var(--primary)]"
                          initial={{ opacity: 0, scaleY: 0.6 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          exit={{ opacity: 0, scaleY: 0.6 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
                        />
                      ) : null}
                    </AnimatePresence>
                    <span>{item.label}</span>
                  </motion.span>
                )}
              </NavLink>
            ))}
          </nav>
        </motion.aside>

        {/* Main */}
        <motion.main
          className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]"
          whileHover={reduce ? undefined : { y: -1 }}
          transition={fast}
        >
          <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--card)]/92 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="min-w-0">
                <motion.div
                  className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]"
                  initial={reduce ? false : { opacity: 0, y: 4 }}
                  animate={reduce ? undefined : { opacity: 1, y: 0 }}
                  transition={fast}
                >
                  {breadcrumb}
                </motion.div>
                <motion.div
                  className="mt-0.5 truncate text-base font-semibold tracking-tight text-[var(--text)]"
                  key={pageTitle}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={reduce ? undefined : { opacity: 1, y: 0 }}
                  transition={normal}
                >
                  {pageTitle}
                </motion.div>
                {pageSubtitle ? (
                  <div className="mt-1 hidden text-sm text-[var(--muted)] sm:block">
                    {pageSubtitle}
                  </div>
                ) : null}
              </div>

              <motion.div
                className="flex items-center gap-2"
                whileHover={reduce ? undefined : { y: -1 }}
                transition={fast}
              >
                <ThemeToggle />

                {/* Secondary action */}
                {location.pathname !== "/rules" ? (
                  <Button variant="secondary" onClick={() => navigate("/rules")}>Manage Rules</Button>
                ) : (
                  <Button variant="secondary" onClick={() => navigate("/history")}>View Reports</Button>
                )}

                {/* Primary action */}
                {location.pathname === "/rewrite" ? (
                  <Button onClick={() => navigate("/rewrite")}>Generate</Button>
                ) : (
                  <Button onClick={() => navigate("/analyze")}>New Audit</Button>
                )}
              </motion.div>
            </div>
          </header>

          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.99, filter: "blur(2px)" }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 1 } : { opacity: 0, y: -10, scale: 0.99, filter: "blur(2px)" }}
                transition={normal}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.main>
      </motion.div>
    </motion.div>
  );
}
