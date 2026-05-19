import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Toast = { id: string; title: string; message?: string };

type ToastCtx = {
  toast: (t: Omit<Toast, "id">) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const reduce = useReducedMotion();

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = crypto?.randomUUID?.() ?? String(Date.now() + Math.random());
    const next = { id, ...t };
    setItems((prev) => [next, ...prev].slice(0, 4));
    window.setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, 2200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <Ctx.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed bottom-4 right-4 z-50 w-[320px] space-y-2">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="pointer-events-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
            >
              <div className="text-sm font-semibold text-[var(--text)]">{t.title}</div>
              {t.message ? (
                <div className="mt-1 text-sm text-[var(--muted)]">{t.message}</div>
              ) : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}