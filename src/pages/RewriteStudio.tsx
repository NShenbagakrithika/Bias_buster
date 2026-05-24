import { useMemo, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

import Card from "../components/Card";
import Page from "../components/Page";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";
import { useToast } from "../components/toast/ToastProvider";
import { generateRewriteVariants, type Tone } from "../core/strategy/rewriteStrategies";
import { historyStore } from "../core/observer/HistoryStore";

type Variant = {
  id: string;
  label: string;
  text: string;
};

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
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

function VariantsSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="h-4 w-28 animate-pulse rounded bg-[color-mix(in_srgb,var(--primary)_10%,var(--card))]" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-[color-mix(in_srgb,var(--primary)_8%,var(--card))]" />
              <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-[color-mix(in_srgb,var(--primary)_8%,var(--card))]" />
            </div>
            <div className="h-9 w-16 animate-pulse rounded-xl bg-[color-mix(in_srgb,var(--primary)_10%,var(--card))]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RewriteStudio() {
  const { toast } = useToast();

  const [tone, setTone] = useState<Tone>("Inclusive");
  const [original, setOriginal] = useState("");
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
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

  async function handleGenerate() {
    if (!original.trim()) {
      toast({ title: "Add text to rewrite", message: "Paste copy first." });
      return;
    }

    setLoading(true);
    setHasRun(true);

    await new Promise((r) => setTimeout(r, 550));

    const out = generateRewriteVariants(tone, original).map((variant, index) => ({
      id: `${tone}-${index}`,
      label: variant.name,
      text: variant.fullText,
    }));
    setVariants(out);
    setExpanded(out[0]?.id ? { [out[0].id]: true } : {});
    setLoading(false);

    historyStore.add({
      kind: "rewrite",
      input: original,
      meta: { tone },
      output: { variants: out },
    });

    toast({ title: "Variants generated", message: `${tone} • ${out.length} options • saved to reports` });
  }

  async function copyAll() {
    if (!variants.length) {
      toast({ title: "Nothing to copy", message: "Generate variants first." });
      return;
    }

    const payload = variants.map((v) => `${v.label}:\n${v.text}`).join("\n\n---\n\n");

    const ok = await copyToClipboard(payload);
    toast({
      title: ok ? "Copied" : "Copy failed",
      message: ok ? "All variants copied to clipboard." : "Your browser blocked clipboard access.",
    });
  }

  return (
    <Page>
      <div className="space-y-5">
        <Card
          title="Inclusive Rewrite Studio"
          subtitle="Turn flagged language into clearer, safer, more inclusive alternatives."
          right={
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={copyAll} disabled={!variants.length}>
                Copy All
              </Button>
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs text-[var(--muted)]">Rewrite Style</label>
              <Select className="mt-1" value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
                <option>Inclusive</option>
                <option>Professional</option>
                <option>Warm</option>
                <option>Concise</option>
              </Select>
            </div>
            <div className="md:col-span-2 flex items-end">
              <Button className="w-full" isLoading={loading} onClick={handleGenerate}>
                Generate Variants
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs text-[var(--muted)]">Input</label>
            <Textarea
              className="mt-1 min-h-[140px]"
              placeholder="Paste your copy here…"
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
            />
            <div className="mt-2 text-xs text-[var(--muted)]">
              Tip: Include the headline + CTA line for stronger variants.
            </div>
          </div>
        </Card>

        <Card
          title="Variants"
          subtitle={hasRun ? "Generated options. Copy the best and move on." : "Generate variants to see outputs here."}
        >
          {!hasRun ? (
            <div className="text-sm text-[var(--muted)]">No variants yet.</div>
          ) : loading ? (
            <VariantsSkeleton />
          ) : variants.length === 0 ? (
            <div className="text-sm text-[var(--muted)]">No variants.</div>
          ) : (
            <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-2">
              {variants.map((v) => (
                <motion.div
                  key={v.id}
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
                    onClick={() => setExpanded((prev) => ({ ...prev, [v.id]: !prev[v.id] }))}
                    className="flex w-full items-start justify-between gap-3 text-left"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-[var(--text)]">{v.label}</div>
                        <motion.span
                          aria-hidden
                          initial={false}
                          animate={{ rotate: expanded[v.id] ? 180 : 0 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
                          className="text-xs text-[var(--muted)]"
                        >
                          ▾
                        </motion.span>
                      </div>
                      <div className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{v.text}</div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const ok = await copyToClipboard(v.text);
                          toast({
                            title: ok ? "Copied" : "Copy failed",
                            message: ok ? v.label : "Your browser blocked clipboard access.",
                          });
                        }}
                      >
                        Copy
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOriginal(v.text);
                          toast({ title: "Applied", message: `${v.label} moved to input.` });
                        }}
                      >
                        Use
                      </Button>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded[v.id] ? (
                      <motion.div
                        key="expanded"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
                        className="mt-3 rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--primary)_4%,var(--card))] p-3"
                      >
                        <div className="text-xs font-semibold text-[var(--text)]">Full text</div>
                        <div className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">
                          {v.text}
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
