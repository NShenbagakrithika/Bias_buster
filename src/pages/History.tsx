import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

import Card from "../components/Card";
import Page from "../components/Page";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import { useToast } from "../components/toast/ToastProvider";
import { historyStore, type HistoryItem, type HistoryKind } from "../core/observer/HistoryStore";

function fmt(ts: number) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

export default function History() {
  const { toast } = useToast();

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<"all" | HistoryKind>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = historyStore.subscribe((next) => setItems(next));
    return () => unsub();
  }, []);

  function refresh() {
    setItems(historyStore.getAll());
    toast({ title: "Reports refreshed" });
  }

  function clearAll() {
    historyStore.clear();
    setOpenId(null);
    toast({ title: "Reports cleared" });
  }

  function removeOne(id: string) {
    const next = items.filter((x) => x.id !== id);
    // Store currently doesn't expose remove(id), so we overwrite storage via clear + re-add.
    // This keeps the page working and the Observer updates consistent.
    historyStore.clear();
    // Re-add in reverse to preserve order
    [...next].reverse().forEach((it) => {
      historyStore.add({ kind: it.kind, input: it.input, meta: it.meta });
    });

    if (openId === id) setOpenId(null);
    toast({ title: "Removed", message: "Entry deleted from reports." });
  }

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((x) => x.kind === filter);
  }, [items, filter]);

  const listVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
  };

  const rowVariants: Variants = {
    hidden: { opacity: 0, y: 6 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <Page>
      <div className="space-y-5">
        <Card
          title="Reports"
          subtitle="Saved audits and rewrites stored locally on this device."
          right={
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={refresh}>
                Refresh
              </Button>
              <Button variant="secondary" onClick={clearAll}>
                Clear
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-sm text-[var(--muted)]">
              Total: <span className="font-semibold text-[var(--text)]">{items.length}</span>
            </div>
            <div className="w-full sm:w-[220px]">
              <label className="text-xs text-[var(--muted)]">Filter</label>
              <Select className="mt-1" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
                <option value="all">All</option>
                <option value="audit">Audit</option>
                <option value="rewrite">Rewrite Studio</option>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            {filtered.length === 0 ? (
              <div className="text-sm text-[var(--muted)]">No reports yet. Run an audit or generate rewrites to see them here.</div>
            ) : (
              <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-2">
                {filtered.map((it) => {
                  const isOpen = openId === it.id;

                  const title =
                    it.kind === "audit"
                      ? `Audit • ${it.meta?.mode ?? "—"} • ${it.meta?.contentType ?? "—"}`
                      : `Rewrite • ${it.meta?.tone ?? "—"}`;

                  const subtitle = fmt(it.createdAt);

                  return (
                    <motion.div key={it.id} variants={rowVariants}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setOpenId((p) => (p === it.id ? null : it.id))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setOpenId((p) => (p === it.id ? null : it.id));
                          }
                        }}
                        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:bg-[color-mix(in_srgb,var(--primary)_6%,var(--card))] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-[var(--text)]">{title}</div>
                            <div className="mt-1 text-xs text-[var(--muted)]">{subtitle}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--primary)_6%,var(--card))] px-2.5 py-1 text-xs font-semibold text-[var(--text)]">
                              {it.kind}
                            </span>
                            <Button
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeOne(it.id);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {isOpen ? (
                          <motion.div
                            key={it.id + ":detail"}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--primary)_3%,var(--card))] p-4">
                              <>
                                <div className="text-xs font-semibold text-[var(--text)]">Input</div>
                                <div className="mt-1 whitespace-pre-wrap text-sm text-[var(--muted)]">{it.input}</div>

                                <div className="mt-4 flex items-center justify-between">
                                  <div className="text-xs font-semibold text-[var(--text)]">Meta</div>
                                  <Button
                                    variant="secondary"
                                    onClick={async () => {
                                      const payload = `${title}\n${subtitle}\n\nInput:\n${it.input}\n\nMeta:\n${JSON.stringify(it.meta ?? {}, null, 2)}`;
                                      try {
                                        await navigator.clipboard.writeText(payload);
                                        toast({ title: "Copied", message: "Report copied." });
                                      } catch {
                                        toast({ title: "Copy failed", message: "Clipboard permission blocked." });
                                      }
                                    }}
                                  >
                                    Copy
                                  </Button>
                                </div>

                                <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
                                  <pre className="whitespace-pre-wrap text-xs text-[var(--muted)]">{JSON.stringify(it.meta ?? {}, null, 2)}</pre>
                                </div>
                              </>
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </Card>
      </div>
    </Page>
  );
}