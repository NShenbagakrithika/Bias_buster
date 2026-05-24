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
        id: "gender",
        name: "Gender Bias",
        description: "Flags gender-coded words and role labels that can narrow who feels invited.",
        example: "‘Rockstar salesman’ → ‘skilled sales specialist’.",
        severity: "High",
      },
      {
        id: "age",
        name: "Age Bias",
        description: "Flags phrases that imply preference for younger or older people.",
        example: "‘Young digital native’ → ‘comfortable learning new tools’.",
        severity: "High",
      },
      {
        id: "disability",
        name: "Disability Bias",
        description: "Flags ableist or stigmatizing metaphors tied to disability or mental health.",
        example: "‘Sanity check’ → ‘review’. ‘Blind spot’ → ‘missed risk’.",
        severity: "High",
      },
      {
        id: "culture",
        name: "Cultural Bias",
        description: "Flags cultural gatekeeping and vague belonging language.",
        example: "‘Culture fit’ → ‘values-aligned collaboration’.",
        severity: "Medium",
      },
      {
        id: "socioeconomic",
        name: "Socioeconomic Bias",
        description: "Flags pedigree, access, or background filters that may exclude qualified people.",
        example: "‘Ivy League preferred’ → ‘relevant work samples or equivalent experience’.",
        severity: "Medium",
      },
      {
        id: "tone",
        name: "Tone Bias",
        description: "Flags combative wording that can signal exclusionary or high-pressure culture.",
        example: "‘Crush targets’ → ‘deliver measurable results’.",
        severity: "Medium",
      },
      {
        id: "evidence",
        name: "Evidence Risk",
        description: "Flags absolute claims that need proof or softer language.",
        example: "‘100% guaranteed’ → ‘designed to help’ with a supporting metric.",
        severity: "Medium",
      },
      {
        id: "accessibility",
        name: "Accessibility Clarity",
        description: "Flags vague action text and assumptions about what is obvious or easy.",
        example: "‘Click here’ → ‘Download the report’.",
        severity: "Low",
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
          title="Bias Rules"
          subtitle="Control which inclusion checks are enabled. Changes apply instantly."
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
