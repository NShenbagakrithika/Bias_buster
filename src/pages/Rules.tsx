import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Card from "../components/Card";
import Page from "../components/Page";
import { useToast } from "../components/toast/ToastProvider";
import { RulesRegistry } from "../core/singleton/RulesRegistry";

type Rule = {
  id: string;
  name: string;
  description: string;
  example: string;
  severity: "High" | "Medium" | "Low";
};

function sevPill(sev: Rule["severity"]) {
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

export default function Rules() {
  const { toast } = useToast();

  const rules: Rule[] = useMemo(
    () => [
      {
        id: "clarity",
        name: "Clarity Check",
        description: "Flags vague promises and unclear outcomes that confuse the reader.",
        example: "Instead of: ‘Boost your growth’ → ‘Increase qualified leads in 30 days’.",
        severity: "Medium",
      },
      {
        id: "specificity",
        name: "Specificity Check",
        description: "Detects generic language that fails to communicate a concrete value.",
        example: "Add numbers, timeframes, constraints, or scope. ‘Faster onboarding’ → ‘Onboard in 3 steps’.",
        severity: "Medium",
      },
      {
        id: "proof",
        name: "Proof Check",
        description: "Flags claims that require evidence (metrics, case lines, examples).",
        example: "If you say ‘#1’ or ‘guaranteed’, add the source or rephrase to be compliant.",
        severity: "High",
      },
      {
        id: "cta",
        name: "CTA Check",
        description: "Ensures the next step is explicit and low-friction.",
        example: "‘Get started’ → ‘Get a 30‑second audit summary’.",
        severity: "Low",
      },
      {
        id: "compliance",
        name: "Compliance Check",
        description: "Flags risky wording and unsupported guarantees.",
        example: "Avoid absolute claims unless you can prove them: ‘100% guaranteed’ → ‘Designed to improve…’.",
        severity: "High",
      },
    ],
    []
  );

  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => {
    const defaults = Object.fromEntries(rules.map((r) => [r.id, true])) as Record<string, boolean>;
    return RulesRegistry.getInstance().load(defaults);
  });
  const [openId, setOpenId] = useState<string | null>(null);

  function toggleEnabled(id: string, next: boolean) {
    // Persist first (Singleton) so other pages read the same source of truth
    RulesRegistry.getInstance().set(id, next);

    // Update local UI state
    setEnabled((prev) => ({ ...prev, [id]: next }));

    toast({
      title: "Rules updated",
      message: next ? "Rule enabled." : "Rule disabled.",
    });
  }

  return (
    <Page>
      <div className="space-y-5">
        <Card
          title="Rules"
          subtitle="Control which checks are enabled. Changes apply instantly."
        >
          <div className="space-y-3">
            {rules.map((r) => {
              const isOpen = openId === r.id;
              const isOn = !!enabled[r.id];

              return (
                <div key={r.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpenId((prev) => (prev === r.id ? null : r.id))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenId((prev) => (prev === r.id ? null : r.id));
                      }
                    }}
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:bg-[color-mix(in_srgb,var(--primary)_6%,var(--card))] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    aria-expanded={isOpen}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-semibold text-[var(--text)]">
                          {r.name}
                        </div>
                        <span
                          className={
                            "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold " +
                            sevPill(r.severity)
                          }
                        >
                          {r.severity}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-[var(--muted)]">
                        Enable or disable this check. Open details to see what it flags.
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isOn}
                        onChange={(e) => toggleEnabled(r.id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-5 w-5 accent-[var(--primary)]"
                        aria-label={`Toggle ${r.name}`}
                      />
                      <span className="text-xs text-[var(--muted)]">
                        {isOpen ? "Hide" : "Details"}
                      </span>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--primary)_3%,var(--card))] p-4">
                          <div className="text-xs font-semibold text-[var(--text)]">
                            What it checks
                          </div>
                          <div className="mt-1 text-sm text-[var(--muted)]">
                            {r.description}
                          </div>

                          <div className="mt-3 text-xs font-semibold text-[var(--text)]">
                            Example
                          </div>
                          <div className="mt-1 text-sm text-[var(--muted)]">
                            {r.example}
                          </div>

                          <div className="mt-3 text-xs text-[var(--muted)]">
                            Status: {isOn ? "Enabled" : "Disabled"}
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </Page>
  );
}