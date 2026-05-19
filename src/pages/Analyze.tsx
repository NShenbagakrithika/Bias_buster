import { useMemo, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

import Card from "../components/Card";
import Page from "../components/Page";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";
import { useToast } from "../components/toast/ToastProvider";

// Core (Design Patterns)
import { runAuditChain, type Finding, type Severity } from "../core/chain/auditChain";
import {
  createAuditPipelineFromRegistry,
  type ContentType,
} from "../core/factory/auditPipelineFactory";
import { historyStore } from "../core/observer/HistoryStore";

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

  const [contentType, setContentType] = useState<ContentType>("Ad");
  const [mode, setMode] = useState("B2B SaaS");
  const [copy, setCopy] = useState("");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Finding[]>([]);
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

    // Expand first finding for nicer UX
    const first = findings[0]?.id;
    setExpanded(first ? { [first]: true } : {});

    // Observer: store event for Reports page
    historyStore.add({
      kind: "audit",
      input: copy,
      meta: { mode, contentType },
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
          title="Copy Audit"
          subtitle="Choose a type and mode, paste copy, and get clear findings with suggested fixes."
          right={
            <div className="hidden sm:block text-xs text-[var(--muted)]">
              Preset: <span className="font-semibold text-[var(--text)]">{mode}</span>
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs text-[var(--muted)]">Content Type</label>
              <Select
                className="mt-1"
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
              >
                <option>Ad</option>
                <option>Landing Page</option>
                <option>Email</option>
                <option>Generic</option>
              </Select>
            </div>

            <div>
              <label className="text-xs text-[var(--muted)]">Mode</label>
              <Select
                className="mt-1"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option>B2B SaaS</option>
                <option>D2C</option>
                <option>Healthcare Safe</option>
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
            <div className="mt-2 text-xs text-[var(--muted)]">
              Tip: include the headline and CTA line for the most useful findings.
            </div>
          </div>
        </Card>

        <Card
          title="Results"
          subtitle={
            hasRun ? "Findings from your latest audit." : "Run an audit to generate findings."
          }
        >
          {!hasRun ? (
            <div className="text-sm text-[var(--muted)]">
              Paste copy above and run an audit to see findings.
            </div>
          ) : loading ? (
            <ResultsSkeleton />
          ) : results.length === 0 ? (
            <div className="text-sm text-[var(--muted)]">No findings.</div>
          ) : (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
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
                            <div className="text-xs font-semibold text-[var(--text)]">
                              Suggestion
                            </div>
                            <div className="mt-1 text-sm text-[var(--muted)]">
                              {r.suggestion}
                            </div>
                          </div>

                          <Button
                            variant="secondary"
                            className="shrink-0"
                            onClick={async () => {
                              const ok = await copyToClipboard(r.suggestion ?? "");
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
          )}
        </Card>
      </div>
    </Page>
  );
}