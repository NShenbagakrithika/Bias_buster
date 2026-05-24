import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import Card from "../components/Card";
import Button from "../components/ui/Button";
import Page from "../components/Page";

export default function Home() {
  // Keep motion typing simple to avoid TS friction across framer-motion versions
  const ease: any = [0.16, 1, 0.3, 1];

  return (
    <Page>
      <div className="mx-auto max-w-5xl space-y-8">
        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease }}
          className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--primary)_6%,var(--card))] px-3 py-1 text-xs font-semibold text-[var(--text)]">
            <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
            Bias audit • Inclusive rewrites • Explainable reports
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight leading-tight text-[var(--text)] md:text-5xl md:whitespace-nowrap">
            <span className="text-[var(--text)]">Bias Buster</span>
            <span className="text-[color-mix(in_srgb,var(--primary)_85%,var(--text))]">
              {" "}— find exclusion risk before your words go live.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-[var(--muted)]">
            Scan job descriptions, campaigns, forms, and policy copy for biased wording, unclear assumptions,
            and accessibility risks. Get a score, an explanation, and rewrite options you can use immediately.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }} transition={{ duration: 0.16, ease }}>
              <Link to="/workspace">
                <Button>Open Workspace</Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }} transition={{ duration: 0.16, ease }}>
              <Link to="/analyze">
                <Button variant="secondary">Run Bias Audit</Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }} transition={{ duration: 0.16, ease }}>
              <Link to="/rewrite">
                <Button variant="secondary">Rewrite Studio</Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* VALUE STRIP */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.22, ease }}
          className="grid gap-4 md:grid-cols-3"
        >
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="text-sm font-semibold text-[var(--text)]">Explainable scoring</div>
            <div className="mt-1 text-sm text-[var(--muted)]">Every audit gives a risk score, category breakdown, and reason.</div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="text-sm font-semibold text-[var(--text)]">Market-ready use cases</div>
            <div className="mt-1 text-sm text-[var(--muted)]">Review hiring, marketing, education, healthcare, and general copy.</div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="text-sm font-semibold text-[var(--text)]">Fixes included</div>
            <div className="mt-1 text-sm text-[var(--muted)]">Copy inclusive rewrites directly into your workflow.</div>
          </div>
        </motion.section>

        {/* HOW IT WORKS */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.22, ease }}
        >
          <Card title="How it works" subtitle="A practical review loop for high-stakes text.">
            <ol className="space-y-3 text-sm">
              <li className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="text-xs font-semibold text-[var(--muted)]">Step 1</div>
                <div className="mt-1 font-semibold text-[var(--text)]">Choose the use case</div>
                <div className="mt-1 text-[var(--muted)]">Hiring, marketing, education, healthcare, or general review.</div>
              </li>
              <li className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="text-xs font-semibold text-[var(--muted)]">Step 2</div>
                <div className="mt-1 font-semibold text-[var(--text)]">Run a bias audit</div>
                <div className="mt-1 text-[var(--muted)]">Get severity-tagged issues with the exact phrase that was flagged.</div>
              </li>
              <li className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="text-xs font-semibold text-[var(--muted)]">Step 3</div>
                <div className="mt-1 font-semibold text-[var(--text)]">Rewrite and report</div>
                <div className="mt-1 text-[var(--muted)]">Copy inclusive alternatives and keep local reports for review.</div>
              </li>
            </ol>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/rules">
                <Button variant="secondary">Manage Rules</Button>
              </Link>
              <Link to="/workspace">
                <Button>Open Workspace</Button>
              </Link>
            </div>
          </Card>
        </motion.section>

        {/* FOOTER */}
        <motion.footer
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.22, ease }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="text-sm font-semibold text-[var(--text)]">Bias Buster</div>
              <div className="mt-1 text-sm text-[var(--muted)]">Explainable inclusion QA for text that represents people.</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/workspace">
                <Button variant="secondary">Workspace</Button>
              </Link>
              <Link to="/analyze">
                <Button variant="secondary">Bias Audit</Button>
              </Link>
              <Link to="/rewrite">
                <Button variant="secondary">Rewrite</Button>
              </Link>
              <Link to="/history">
                <Button variant="secondary">Reports</Button>
              </Link>
            </div>
          </div>
        </motion.footer>
      </div>
    </Page>
  );
}
