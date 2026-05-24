import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import Card from "../components/Card";
import Page from "../components/Page";
import Button from "../components/ui/Button";

import { workspaceFacade } from "../core/facade/WorkspaceFacade";
import type { HistoryItem } from "../core/observer/HistoryStore";

export default function Workspace() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // Facade hides observer/storage details
    const unsub = workspaceFacade.subscribeReports((items) => setHistory(items));
    return () => unsub();
  }, []);

  const recent = useMemo(() => history.slice(0, 5), [history]);

  const usageLimit = workspaceFacade.getUsageLimit();
  const usage = Math.min(history.length, usageLimit);
  const usagePercent = usageLimit === 0 ? 0 : (usage / usageLimit) * 100;

  return (
    <Page>
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
          className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8"
        >
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)] md:text-3xl">
            Workspace
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Run bias audits, generate inclusive rewrites, manage review rules, and keep local reports in one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/analyze">
              <Button>New Bias Audit</Button>
            </Link>
            <Link to="/rewrite">
              <Button variant="secondary">Inclusive Rewrite</Button>
            </Link>
            <Link to="/rules">
              <Button variant="ghost">Manage Rules</Button>
            </Link>
          </div>
        </motion.div>

        {/* Usage */}
        <Card
          title="Usage"
          subtitle="Demo quota — local only."
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted)]">
              Reviews this week
            </span>
            <span className="font-semibold text-[var(--text)]">
              {usage}/{usageLimit}
            </span>
          </div>

          <div className="mt-3 h-2 w-full rounded-full bg-[var(--border)]">
            <div
              className="h-2 rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </Card>

        {/* Recent Reports */}
        <Card
          title="Recent Reports"
          subtitle="Your latest audits and rewrites."
        >
          {recent.length === 0 ? (
            <div className="text-sm text-[var(--muted)]">
              No reports yet. Run your first bias audit to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((item, idx) => (
                <motion.div
                  key={item.id ?? idx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-3"
                >
                  <div className="text-sm text-[var(--text)]">
                    {item.kind === "rewrite" ? "Rewrite" : "Audit"}
                  </div>
                  <Link to="/history">
                    <Button variant="secondary">View</Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Page>
  );
}
