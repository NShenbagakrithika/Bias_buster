import { useMemo, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

import Card from "../components/Card";
import Page from "../components/Page";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";
import { useToast } from "../components/toast/ToastProvider";

// Core (Design Patterns)
import {
  runAuditChain,
  summarizeFindings,
  type AuditSummary,
  type Finding,
  type Severity,
} from "../core/chain/auditChain";
import {
  createAuditPipelineFromRegistry,
  type ContentType,
} from "../core/factory/auditPipelineFactory";
import { historyStore } from "../core/observer/HistoryStore";

const sampleInputs: Record<ContentType, string> = {
  Hiring:
    "We need a young digital native rockstar who can crush targets, fit our culture, and speak native English. Ivy League background preferred.",
  Marketing:
    "Our revolutionary platform is guaranteed to help normal users dominate their market. Click here to get started.",
  Education:
    "This simple program is easy for everyone and ideal for mature candidates with no gaps and polished backgrounds.",
  Healthcare:
    "This 100% guaranteed treatment is a sanity check for patients who want normal results instantly. See below.",
  General:
    "We need a guru who can lead the war room, avoid blind spots, and deliver world-class results with no risk.",
};

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function badgeClass(sev: Severity) {
  // Subtle, professional semantic tint (token-friendly)
  switch (sev) {
    case "High":
      return "border border-[var(--border)] bg-[color-mix(in_srgb,#ef4444_8%,var(--card))] text-[var(--text)]";
    case "Medium":
      return "border border-[var(--border)] bg-[color-mix(in_srgb,#f59e0b_10%,var(--card))] text-[var(--text)]";
    case "Low":
      return "border border-[var(--border)] bg-[color-mix(in_srgb,#22c55e_8%,var(--card))] text-[var(--text)]";
    default:
      return "border border-[var(--border)] bg-[var(--card)] text-[var(--text)]";
  }
}

function scoreTone(summary: AuditSummary) {
  if (summary.score >= 78) return "text-[color-mix(in_srgb,#16a34a_80%,var(--text))]";
  if (summary.score >= 50) return "text-[color-mix(in_srgb,#d97706_80%,var(--text))]";
  return "text-[color-mix(in_srgb,#dc2626_85%,var(--text))]";
}

function ResultsSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="h-4 w-24 animate-pulse rounded bg-[color-mix(in_srgb,var(--primary)_10%,var(--card))]" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-[color-mix(in_srgb,var(--primary)_8%,var(--card))]" />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-[color-mix(in_srgb,var(--primary)_8%,var(--card))]" />
            </div>
            <div className="h-7 w-16 animate-pulse rounded-full bg-[color-mix(in_srgb,var(--primary)_10%,var(--card))]" />
          </div>
          <div className="mt-3 rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--primary)_4%,var(--card))] p-3">
            <div className="h-3 w-24 animate-pulse rounded bg-[color-mix(in_srgb,var(--primary)_10%,var(--card))]" />
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-[color-mix(in_srgb,var(--primary)_8%,var(--card))]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Analyze() {
  const { toast } = useToast();

  const [contentType, setContentType] = useState<ContentType>("Hiring");
  const [mode, setMode] = useState("Strict");
  const [copy, setCopy] = useState("");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Finding[]>([]);
  const [summary, setSummary] = useState<AuditSummary>(() => summarizeFindings([]));
  const [hasRun, setHasRun] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const listVariants = useMemo(
    () =>
      ({
        hidden: { opacity: 1 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.06, delayChildren: 0.04 },
        },
      } as Variants),
    []
  );

  const itemVariants = useMemo(
    () =>
      ({
        hidden: { opacity: 0, y: 10, scale: 0.995 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
        },
      } as Variants),
    []
  );

  async function handleAnalyze() {
    if (!copy.trim()) {
      toast({ title: "Add some copy", message: "Paste text to analyze first." });
      return;
    }

    setLoading(true);
    setHasRun(true);

    // Simulate analysis latency (swap to real engine later)
    await new Promise((r) => setTimeout(r, 550));

    // Factory + Singleton: pipeline depends on contentType and enabled rules
    const chain = createAuditPipelineFromRegistry(contentType);

    // Chain of Responsibility: ctx flows through chain, each rule can add findings
    const findings = runAuditChain(chain, {
      input: copy,
      contentType,
      mode,
    });

    setResults(findings);
    const nextSummary = summarizeFindings(findings);
    setSummary(nextSummary);

    // Expand first finding for nicer UX
    const first = findings[0]?.id;
    setExpanded(first ? { [first]: true } : {});

    // Observer: store event for Reports page
    historyStore.add({
      kind: "audit",
      input: copy,
      meta: { mode, contentType },
      output: { findings, summary: nextSummary },
    });

    setLoading(false);

    toast({
      title: "Audit complete",
      message: `${mode} • ${contentType} • ${findings.length} findings • saved to reports`,
    });
  }

  return (
    <Page>
      <div className="space-y-5">
        <Card
          title="Bias Audit"
          subtitle="Scan hiring, marketing, education, or healthcare text for exclusion risk and inclusive rewrite opportunities."
          right={
            <div className="hidden sm:block text-xs text-[var(--muted)]">
              Preset: <span className="font-semibold text-[var(--text)]">{mode}</span>
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs text-[var(--muted)]">Use Case</label>
              <Select
                className="mt-1"
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
              >
                <option>Hiring</option>
                <option>Marketing</option>
                <option>Education</option>
                <option>Healthcare</option>
                <option>General</option>
              </Select>
            </div>

            <div>
              <label className="text-xs text-[var(--muted)]">Review Mode</label>
              <Select
                className="mt-1"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option>Strict</option>
                <option>Balanced</option>
                <option>Fast Review</option>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full" isLoading={loading} onClick={handleAnalyze}>
                Run Audit
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs text-[var(--muted)]">Input</label>
            <Textarea
              className="mt-1 min-h-[180px]"
              placeholder="Paste your copy here…"
              value={copy}
              onChange={(e) => setCopy(e.target.value)}
            />
            <div className="mt-2 flex flex-col gap-2 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
              <span>Tip: paste the exact text people will see for the most useful findings.</span>
              <button
                type="button"
                className="text-left font-semibold text-[var(--primary)] hover:underline sm:text-right"
                onClick={() => setCopy(sampleInputs[contentType])}
              >
                Load market-impact sample
              </button>
            </div>
          </div>
        </Card>

        <Card
          title="Results"
          subtitle={
            hasRun ? "Risk score, category breakdown, and explainable fixes." : "Run an audit to generate findings."
          }
        >
          {!hasRun ? (
            <div className="text-sm text-[var(--muted)]">
              Paste copy above and run an audit to see findings.
            </div>
          ) : loading ? (
            <ResultsSkeleton />
          ) : results.length === 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,#22c55e_7%,var(--card))] p-4">
              <div className={`text-3xl font-semibold ${scoreTone(summary)}`}>{summary.score}</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text)]">{summary.level}</div>
              <div className="mt-1 text-sm text-[var(--muted)]">{summary.headline}</div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                <div className="rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--primary)_4%,var(--card))] p-4">
                  <div className={`text-4xl font-semibold ${scoreTone(summary)}`}>{summary.score}</div>
                  <div className="mt-1 text-sm font-semibold text-[var(--text)]">{summary.level}</div>
                  <div className="mt-2 text-xs leading-5 text-[var(--muted)]">{summary.headline}</div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(summary.categories).map(([category, count]) => (
                    <div
                      key={category}
                      className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3"
                    >
                      <div className="text-xs font-semibold text-[var(--muted)]">{category}</div>
                      <div className="mt-1 text-xl font-semibold text-[var(--text)]">{count}</div>
                    </div>
                  ))}
                </div>
              </div>

              <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-2">
                {results.map((r) => (
                <motion.div
                  key={r.id}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.995 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
                  className={
                    "rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors " +
                    "hover:border-[color-mix(in_srgb,var(--primary)_30%,var(--border))] " +
                    "hover:bg-[color-mix(in_srgb,var(--primary)_4%,var(--card))]"
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((prev) => ({ ...prev, [r.id]: !prev[r.id] }))
                    }
                    className="flex w-full items-start justify-between gap-3 text-left"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-[var(--text)]">
                          {r.title}
                        </div>
                        <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted)]">
                          {r.category}
                        </span>
                        <motion.span
                          aria-hidden
                          initial={false}
                          animate={{ rotate: expanded[r.id] ? 180 : 0 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
                          className="text-xs text-[var(--muted)]"
                        >
                          ▾
                        </motion.span>
                      </div>
                      <div className="mt-1 text-sm text-[var(--muted)]">{r.detail}</div>
                      {r.matchedText ? (
                        <div className="mt-2 text-xs text-[var(--muted)]">
                          Flagged: <span className="font-semibold text-[var(--text)]">{r.matchedText}</span>
                        </div>
                      ) : null}
                    </div>

                    <span
                      className={
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold " +
                        badgeClass(r.severity)
                      }
                    >
                      {r.severity}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded[r.id] ? (
                      <motion.div
                        key="suggestion"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
                        className="mt-3 rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--primary)_4%,var(--card))] p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[var(--text)]">Suggestion</div>
                            <div className="mt-1 text-sm text-[var(--muted)]">
                              {r.suggestion}
                            </div>
                            <div className="mt-3 text-xs font-semibold text-[var(--text)]">Inclusive rewrite</div>
                            <div className="mt-1 text-sm text-[var(--muted)]">{r.inclusiveRewrite}</div>
                          </div>

                          <Button
                            variant="secondary"
                            className="shrink-0"
                            onClick={async () => {
                              const ok = await copyToClipboard(r.inclusiveRewrite);
                              toast({
                                title: ok ? "Copied" : "Copy failed",
                                message: ok
                                  ? "Suggestion copied to clipboard."
                                  : "Your browser blocked clipboard access.",
                              });
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              ))}
              </motion.div>
            </div>
          )}
        </Card>
      </div>
    </Page>
  );
}
